---
title: Reinforcement Learning
date: 2024-12-11 23:03
tags:
    - "RL"
    - "NeuroScience"
    - "BehavioralScience"
    - "OptimizationTheory"
    - "BellmanEquation"
categories:
    - "RL"
    - "LLM"
    - "PostTraining"
---

As the modern AI eras, how to use the powerful machine learning techniques to solve optimization problems. Especially with open sourced pre-train LLM, how to use less but high quality data, with less training cost to tune the model to complete specific tasks or behave as an agent role.


### Bellman Optimality

Played as a key concept in dynamic programming and reinforcement learning that provides a mathematical framework for finding optimal solutions to decision-making problems.

#### Definition

The Bellman Optimality Equation descries the relationship between the value of a state and the values of subsequent states, these subsequent states followed by an optimal policy. It is foundational for solving Markov Decision Processes (MDPs)

### Key Components

**state(s)**: a representation of the current situation in the environment
**action(a)**: the decision or choice made in the current state
**reward(r)**: the immediate feedback received after taking an action
**policy($\pi$)**: a strategy or rule that specifies the actions to take in each state
**value(v)**: value function that measures the expected long-term return of a state under a specific policy

given that above key components, the Bellman Optimality for value function is,

$$
V^*(s) = \max_a \left[ R(s, a) + \gamma \sum_{s'} P(s' \mid s, a) V^*(s') \right]
$$

where

**$V^*(s)$**: optimal value of state $s$
**$R(s, a)$**: reward received after taking action $a$ in state $s$
**$P(s' \mid s, a)$**: transition probability to state $s'$ after action $a$
**$\gamma$**: discount factor for future rewards, range [0, 1]

### Implement Bellman Equation In Practice




