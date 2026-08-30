---
layout: post
title: Auto Regressive
date: 2024-12-21 23:32:31
tags:
mathjax: true
---
An Auto-Regressive (AR) model is a type of statistical model used in time series analysis to describe how the current value of a time series depends on its previous values (i.e. its own historical data).

The term “auto-regressive” means that the model regresses the current value of the series on its own past value. It’s commonly used for forecasting and understanding the dynamics of time series data.

## Key Concept

The AR model assumes that the current value $X_t$ of a time series in a linear combination of its previous values and a random error term.

## Mathematical Representation

A $p-order$ auto-regressive model $AR(p)$ is a linear formula of,

$$
X_t = c + \phi_1X_{t-1} + \phi_2X_{t-2} + … + \phi_pX_{t-p} + \epsilon_t
$$

where

$X_t$: the value at time t
$c$: a constant term
$\phi_1, \phi_2,…,\phi_p$: coefficients of the model representing the weights of past values
$p$: the number of past time steps or lagged terms that the model uses to predict the current value, order of the AR model
$\epsilon_t$: a random error term (white noise), assumed to have a mean of 0 and constant variance

### First-order AR Model and Dynamic Programming

A first order AR model $AR(1)$,

$$
X_t = c + \phi_1X_{t-1} + \epsilon_t
$$

The current value $X_t$ is determined by:

A constant term $c$
A weighted contribution from the previous value $X_{t-1}$
A random noise term $\epsilon_t$

This formula looks very close to a type of programming problems - dynamic programming - they both derive the current value based on previous state, but AR is more focus on prediction, DP is more focus on most optimized solution.

### The Order in AR model
In an $AR(p)$ model, the order $p$ specifies how many prior time steps $X_{t-1},X_{t-2},…,X_{t-p}$ are included in the model to predict $X_t$,

- A higher-order model can capture more complex dependencies on the past values of the series
- The choice of $p$ depends on the data and the structure of the time series

#### Determination the Order $P$

Partial Auto-correlation Function (PACF): identifies significant lags to include
Model Selection Criteria: such as AIC(Akaike Information Criterion) or BIC(Bayesian Information Criterion) to find the optimal $p$ that balances complexity and accuracy

### Trade-off
- A higher order increase model complexity and can lead to overfitting if the order is too high for the data
- A lower order might miss important temporal dependencies

The order in $AR(p)$ models defines the “memory” of the model - how far back in time the model looks to predict the current value. It controls the number of lagged terms $X_{t-1}, X_{t-2}, …,X_{t-p}$ used in the regression.

### Features
1. Stationarity (稳定性)
- AR models are typically applied to stationary time series, where the mean and variance do not change over time.
- For an $AR(1)$ model, stationarity requires $|\phi_1| < 1$

2. Autocorrelation (自相关性)
- The values of the series are correlated with their past values
- Tools like the auto-correlation function (ACF) and partial auto-correlation function (PACF) are used to identify and fit AR models

### Relationship to Deep Learning
The concept of auto-regression is widely used in deep learning, especially in sequence models,

1. Recurrent Neural Networks (RNNs): used a similar idea to predict the next step in a sequence based on past values.
2. Transformers: auto-regressive structures are used in models like GPT to generate text sequentially, where each token depends on the previously generated tokens.
3, Auto-regressive Language Models: predict the probability of the current word based on the previous sequence of words

### Summary
The AR model is a fundamental concept in time series analysis, providing a simple and effective way to model the relationships between past and present values of a series. It is a key tool in both traditional statistics and modern machine learning approaches for sequence modeling.