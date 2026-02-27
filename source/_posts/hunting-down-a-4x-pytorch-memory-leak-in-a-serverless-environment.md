---
title: Hunting Down a 4x PyTorch Memory Leak in a Serverless Environment
date: 2026-02-26 16:44:15
tags: memory, gc, container, pytorch, cache
---

NOTE: This article was co-authored by myself and a coding agent while investigating a stubborn memory leak. After finally targeting the root cause and applied the fix, I asked the agent to summarize our journey. Credits to the human-AI partnership for this one :)

## The Issue: The 400% Memory Spike for a Single PyTorch Code Snippet

Why does this matter? Cloud platforms bill dynamically based on memory consumption. A 4x spike from a single PyTorch code snippet means costs scale catastrophically when running dozens or hundreds of snippets in sequence.

<figure>
  <img src="image.png" alt="memory spike from 100MB to 400MB for a single pytorch code snippet">
  <figcaption>Memory spike from 100MB to 400MB for a single pytorch code snippet</figcaption>
</figure>

When running a web service (like FastAPI/Uvicorn) that dynamically executes PyTorch code on cloud platforms, managing the VRAM/RAM footprint is a high-stakes game. Memory is expensive, and leaks are costly.

Our environment was **perfectly stable while running general PyTorch logic**, but we hit a wall when utilizing fused operations like `F.scaled_dot_product_attention` After calling this func, the container's memory footprint exploded by 400%. Unlike standard operations that release memory back to the allocator after code execution done, these fused operations seemed to initialize global C++ backend structures that 'stuck' to the process. We weren't just dealing with a spike; we were dealing with a permanent baseline shift that ignored all our attempts at manual cleanup. This will cause catastrophic issue when scaling to handful code runs.

**A note on VRAM vs. RAM:** This entire investigation takes place on RAM. While similar memory management challenges exist on the VRAM, the specific mechanisms discussed here — `fork()`, Copy-On-Write, and cgroup accounting — are all RAM concerns. CUDA VRAM is managed by the GPU driver and is not subject to the same process-level memory semantics.


## First Try: Python's `exec()` and Garbage Collection
When running untrusted or dynamic code via Python's `exec()`, the `namespace` dictionary retains references to all classes, functions, and variables created during execution. 
* **The Naive Fix:** We aggressively used `del` on the namespace, manually recursively cleared out any custom objects caching `torch.Tensor` objects, and forced `gc.collect()`. 
* **The Result:** The memory remained pegged at 4x the baseline.
* **The Lesson:** Python's Garbage Collector handles Python object lifetimes, but PyTorch leans heavily on underlying C++ backend memory pools and caching allocators.

## Second Try: Reset PyTorch's Hidden C++ Caches
PyTorch is a massive C++ library wrapped in Python. When you execute fused operations like `scaled_dot_product_attention`, PyTorch spins up several hidden mechanisms under the hood.
* **The Fix Attempt:** We manually triggered `torch.compiler.reset()`, explicitly cleared allocator caches, cleared JIT registries (`torch._C._jit_clear_class_registry()`), and even used `ctypes` to call `libc.malloc_trim(0)` to force the Linux C-library to return unmapped heap memory back to the OS.
* **The Result:** Memory *still* wouldn't drop on the server dashboard!


## Third Try: OS-level process termination.
Since manual memory/cache clearing did not pull down memory usage, we decided to use the ultimate weapon against memory leaks: OS-level process termination.
We wrapped the PyTorch code execution inside a completely isolated `multiprocessing.Process` worker.
* **The Theory:** When the worker process finishes and exits, the Linux kernel will instantly and brutally destroy the entire process, forcibly reclaiming 100% of the memory used by PyTorch's hidden C++ backend pools.

* **The Result:** We deployed the multiprocessing refactor. The cloud provider's system dashboard spiked during execution, but incredibly, **the dashboard memory still stayed glued at 300 MB after the process exited!**


## The Plot Thickens: Logs vs. Dashboards
Since the system memory chart was not very informative (no breakdowns etc), we injected explicit memory logs around the test execution code:
```
MEMORY [Before Execution]: 85 MB
MEMORY [After Execution (Before Cleanup)]: 314 MB
MEMORY [After Cleanup]: 86 MB
```
The logs confirmed that the Python process *was* successfully releasing the memory! It went from 85 MB -> 314 MB -> back to 86 MB. The Python application was not leaking.

<figure>
  <img src="unhealthy_mem_chart.png" alt="log shows memory released while system memory chart shows only jagged edges">
  <figcaption>Log shows memory released while system memory chart shows only jagged edges</figcaption>
</figure>

However, the cloud provider's system chart still displayed the container's memory hovering above 300 MB indefinitely. How could the process memory drop internally, but the container memory stay high?


## The True Culprit: Linux `fork()` and Copy-On-Write (COW) Memory
We actually on the right track by isolating with `multiprocessing.Process`, the tricky part is by default on Linux, `multiprocessing` uses the `fork` start method.

When a Linux process forks, the child process inherits the parent's entire memory map using a highly efficient trick called **Copy-On-Write**. The child and parent share the exact same physical RAM/VRAM until one of them modifies a page of memory. 

Here is what was actually happening:
1. The main Uvicorn web server (parent) forked a worker process (child) to run the PyTorch code snippet.
2. The child process imported PyTorch, executed the tensor math, and initialized heavy C++ cache pools.
3. This massive memory initialization *dirtied* the shared COW pages — the child got private copies of those pages. When the child process exited, the kernel reclaimed the child's private pages, which is why our in-process memory logs showed memory returning to 86 MB.

**So why did the cloud dashboard still show high memory?**

The cloud provider's dashboard reports **container-level (cgroup) memory usage**, not individual process RSS. Cgroup memory accounting includes more than just process heap memory — it encompasses page cache, slab allocations, kernel page tables, and `glibc` malloc arena fragmentation. When the forked child process performed heavy allocations and then exited, several effects conspired to keep the cgroup memory counter elevated:

* **glibc malloc arena fragmentation:** The child process's malloc arenas may have caused the parent's heap to fragment during the fork. Even after the child exits, the parent's glibc allocator may hold onto large arena mappings that are mostly empty but not returned to the OS.
* **Kernel accounting overhead:** The COW page fault handling, page table entries, and kernel slab caches associated with the fork/exit cycle are charged to the container's cgroup and may not be reclaimed immediately.
* **Page cache effects:** Any file I/O during the child's PyTorch initialization (loading shared libraries, etc.) gets charged to the cgroup's page cache, which the kernel keeps around until memory pressure forces eviction.

The key insight: **the Python process was not leaking**, but the container's cgroup memory accounting was inflated by side effects of the `fork` lifecycle.

## The Solution: The `"spawn"` Context
The ultimate fix was deceptively simple: explicitly changing the multiprocessing start method from `"fork"` to `"spawn"`.
```python
import multiprocessing as mp

# Instead of p = mp.Process(...)
ctx = mp.get_context('spawn')
p = ctx.Process(target=run_tests_worker, args=(...))
```
Unlike `fork`, the `spawn` method boots up a completely fresh, empty Python interpreter. It does not share the parent's memory map.

* The worker process boots up in a clean address space, imports PyTorch, allocates its C++ caches and tensors, and runs the tests.
* When the worker process finishes and exits, the OS destroys the entire process, fully recovering 100% of the memory. Because the worker was never COW-linked to the parent, there is no arena fragmentation, no shared page table bloat, and no lingering cgroup accounting artifacts.
* The parent Uvicorn process is completely insulated from the C++ memory allocations, ensuring the cloud container's baseline memory stays perfectly flat, entirely avoiding the 4x inflation penalty.

<figure>
  <img src="healthy_mem_chart.png" alt="bring back healthy memory chart">
  <figcaption>Bring back healthy memory chart</figcaption>
</figure>

## Key Takeaways
1. **Python GC is not enough:** `gc.collect()` only clears Python references. It cannot force C++ extensions to release global static caches or workspace memory held by libraries like oneDNN/MKL.
2. **Beware of `fork` with heavy C-extensions:** Using `multiprocessing` with the default `fork` method is dangerous when the child process imports massive C-libraries like PyTorch or TensorFlow. The Copy-On-Write mechanics and resulting glibc arena fragmentation will inadvertently inflate the container's memory footprint.
3. **OS-level isolation is king:** If you are running heavy transient workloads on a memory-constrained cloud service, isolate them in a `"spawn"` process. Terminating a cleanly spawned process is the most reliable way to ensure Linux fully returns the RAM to the hypervisor.
4. **Don't trust the dashboard blindly:** Cloud platforms typically report cgroup-level memory, which includes page cache, kernel overhead, and allocator fragmentation — not just your application's heap. Your process may be behaving correctly even when the dashboard says otherwise.
5. **`malloc_trim` may actually work:** If you see process-level memory drop but dashboard memory stay high, `malloc_trim(0)` might be doing its job. The discrepancy is likely in cgroup accounting, not in your cleanup code.

Happy hunting.

