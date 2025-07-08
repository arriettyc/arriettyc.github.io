---
title: From stochastic to deterministic with Minimize Entropy
date: 2024-12-13 00:00:00
tags:
---

I came across an interesting coding problem that well adopts the concept of solving a stochastic to deterministic solution by minimizing the entropy (uncertainty).

## Problem description (LeetCode 843)
```
You have a bag of words, say each word is unique and with the same length (ie 6), one of these words is a secrete word (and of course you don't know which word is secrete word). Every time you can pick up a word and ask a prophet is the word is the secrete one. Prophet will tell you how close the word with the secrete, 
1. 6 means all letters are positional match with secrete, aka your guess is correct, 
2. 0 means none letters are positional match with secrete, aka worst guess
3. 1-5 means # of letters are positional match with secrete, good or bad guess you decide lol

Goal, working out a strategy to minimize the times to ask prophet
```
and pre-defined prophet func
```python
class Prophet:
    def guess(self, word: str) -> int:
```

## Solution Trajectory

Minimize the times to ask prophet --> Maximize the chances to hit the secrete word --> Minimize the guess space of the secrete word --> Minimize the size of the word bags.

Ok, if every time i made a guess (no matter good or bad guess), and i can use this guess to reduce the size of word bags for next round guess, is it a solution?

How to reduce the size of word bags? An easy and straight forward transitive equation,

word_a <> secrete has 4 letter positional matched
word_a <> word_b has !4 letter positional matched
word_b != secrete

```python
def _similarity(self, s1, s2) -> int:
    return sum(c1==c2 for c1, c2 in zip(s1, s2))

def find_secret_word(self, words: list[str], prophet: Prophet) -> None:
    while words:
        guess_word = random.choice(words)
        score = prophet.guess(guess_word)
        if score == 6:
            return
        
        words_set = set()
        for word in words:
            if self._similarity(word, guess_word) == score:
                words_set.add(word)
        words = list(words_set)
        print(f"{guess_word= } {words= }")
```

Hmm.. noticing `guess_word = random.choice(words)` right? This random pick up a word from the bag making the strategy uncertainty (yes some luck please). Can we make it a deterministic solution? Let's try!

Deterministic solution --> approachable best strategy in each round --> maximize the information from the current state to reduce the uncertainty --> minimize entropy for next round.

How to? If you want to minimize entropy for next round, you need to swipe out noisy words from bag as much as possible, so next round you have the smallest bag to search the target (secrete word).

```python
def find_secret_word(self, words: list[str], prophet: Prophet) -> None:
    count = defaultdict(int)
    while words:
        if len(words) == 1:
            master.guess(words[0])
            return

        max_cnt = 0
        best_guess = (0, 0)
        for i, word in enumerate(words):
            for j in range(i+1, len(words)):
                # print(f"{word=} {words[j]=}")
                score = self._similarity(word, words[j])
                count[(word, score)] += 1
                if count[(word, score)] > max_cnt:
                    max_cnt = count[(word, score)]
                    best_guess = (word, score)
        
        score = prophet.guess(best_guess[0])
        if score == 6:
            return
        words_set = set()
        for word in words:
            # print(f"{word=} {best_guess[0]=}")
            if self._similarity(word, best_guess[0]) == score:
                words_set.add(word)
        words = list(words_set)
```

Pretty fun.


