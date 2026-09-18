# Asymmetric Cost-Weighted Multivariable Regression for Cloud Server Auto-Scaling and Resource Provisioning

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![NumPy](https://img.shields.io/badge/Core%20ML-Pure%20NumPy%20Gradient%20Descent-013243.svg?logo=numpy)](https://numpy.org/)
[![Database](https://img.shields.io/badge/Persistence-SQLite%203-003B57.svg?logo=sqlite)](https://sqlite.org)

An academic machine learning prototype investigating the application of **custom asymmetric cost functions** and **explicit analytical gradient descent optimization** for cloud server resource forecasting and simulated auto-scaling.

---

## Table of Contents
1. [Problem Statement](#1-problem-statement)
2. [Why Cloud Auto-Scaling is Necessary](#2-why-cloud-auto-scaling-is-necessary)
3. [Under-Provisioning vs. Over-Provisioning Dynamics](#3-under-provisioning-vs-over-provisioning-dynamics)
4. [Multivariable Linear Regression Formulation](#4-multivariable-linear-regression-formulation)
5. [The Fundamental Limitation of Mean Squared Error (MSE)](#5-the-fundamental-limitation-of-mean-squared-error-mse)
6. [Proposed Asymmetric Cost Function Formulation](#6-proposed-asymmetric-cost-function-formulation)
7. [Custom Gradient Descent Optimization & Derivation](#7-custom-gradient-descent-optimization--derivation)
8. [Dataset Architecture & Telemetry Characteristics](#8-dataset-architecture--telemetry-characteristics)
9. [Feature Engineering & Normalization](#9-feature-engineering--normalization)
10. [Training Methodology & Chronological Leak-Free Split](#10-training-methodology--chronological-leak-free-split)
11. [Academic Evaluation Metrics](#11-academic-evaluation-metrics)
12. [Baseline vs. Proposed Model: Empirical Results](#12-baseline-vs-proposed-model-empirical-results)
13. [Simulated Auto-Scaling Decision Engine](#13-simulated-auto-scaling-decision-engine)
14. [Academic Prototype Limitations](#14-academic-prototype-limitations)
15. [Future Research Scope](#15-future-research-scope)
16. [System Architecture & Execution Guide](#16-system-architecture--execution-guide)

---

## 1. Problem Statement

Modern cloud infrastructure operating in multitenant virtualized environments (e.g., AWS, Azure, Google Cloud Platform) experiences dynamic, volatile workload demands. Accurate short-term resource forecasting (e.g., for the next 5-minute window) is vital for proactive capacity provisioning.

Conventional regression models utilize **symmetric loss functions** such as Mean Squared Error (MSE). However, in cloud systems, the operational and financial impact of prediction errors is inherently **asymmetric**:
- **Under-predicting** required capacity leads to resource exhaustion, severe latency degradation, HTTP 504 timeouts, dropped transactions, and catastrophic contractual Service Level Agreement (SLA) penalties.
- **Over-predicting** required capacity merely leads to minor, linear cloud resource waste (fractional dollar costs per instance-hour).

This project designs, derives, implements, and evaluates an **Asymmetric Cost-Weighted Multivariable Regression** model trained via explicit gradient descent in Python/NumPy, proving that penalizing under-provisioning exponentially significantly reduces SLA breaches while maintaining an optimal, controlled resource wastage envelope.

---

## 2. Why Cloud Auto-Scaling is Necessary

In traditional on-premises data centers, infrastructure was provisioned for peak annual workloads (e.g., Black Friday traffic), leaving servers operating at 10%–20% average utilization during normal hours, causing massive capital inefficiency. 

With cloud computing:
1. **Elasticity**: Resources must dynamically expand and contract in response to fluctuating user traffic.
2. **Proactive Provisioning**: VM boot times and container spin-up latencies range from 30 seconds to over 3 minutes. Reactive scaling based purely on instant threshold alarms causes severe lag during flash crowds. 
3. **Predictive Auto-Scaling**: Forecasting resource demand **5 minutes in advance** allows cloud orchestrators (e.g., Kubernetes Horizontal Pod Autoscalers, AWS Auto Scaling Groups) to initiate provisioning *before* saturation occurs.

---

## 3. Under-Provisioning vs. Over-Provisioning Dynamics

The cloud provisioning trade-off is fundamentally asymmetrical:

| Attribute | Under-Provisioning ($\hat{y} < y$) | Over-Provisioning ($\hat{y} \ge y$) |
| :--- | :--- | :--- |
| **System Impact** | CPU starvation, memory swapping, connection queuing, packet drops | Idle hypervisor cycles, nominal surplus buffer |
| **User Experience** | Page load degradation, request timeouts, service outages | Optimal low-latency response times |
| **Business Cost** | Severe SLA penalties ($1000s/min), customer churn, brand damage | Marginal cloud compute cost (pennies per hour) |
| **Penalty Curve** | **Exponentially increasing** with deficit depth | **Linear** with surplus magnitude |

---

## 4. Multivariable Linear Regression Formulation

Let the input feature vector for sample $i$ be $\mathbf{x}_i \in \mathbb{R}^D$, consisting of $D=5$ cloud telemetry metrics:
$$\mathbf{x}_i = \begin{bmatrix} x_{i, \text{cpu}} \\ x_{i, \text{mem}} \\ x_{i, \text{net\_in}} \\ x_{i, \text{net\_out}} \\ x_{i, \text{disk\_io}} \end{bmatrix}$$

The linear regression model predicts the continuous required resource capacity $\hat{y}_i$ for the subsequent 5-minute interval:
$$\hat{y}_i = \mathbf{w}^T \mathbf{x}_i + b = \sum_{j=1}^D w_j x_{ij} + b$$
where $\mathbf{w} = [w_1, w_2, \dots, w_D]^T$ is the parameter weight vector and $b$ is the scalar bias (intercept).

---

## 5. The Fundamental Limitation of Mean Squared Error (MSE)

Standard Ordinary Least Squares (OLS) regression minimizes the symmetric Mean Squared Error:
$$\mathcal{L}_{\text{MSE}}(y_i, \hat{y}_i) = \frac{1}{2} (\hat{y}_i - y_i)^2 = \frac{1}{2} e_i^2$$

Because $e_i^2 = (-e_i)^2$:
- An under-prediction of $-5\%$ capacity error incurs a penalty of $\frac{1}{2} (-5)^2 = 12.5$.
- An over-prediction of $+5\%$ capacity error incurs the exact same penalty of $\frac{1}{2} (5)^2 = 12.5$.

In cloud systems engineering, this assumption is fundamentally invalid. Symmetric regression models will naturally converge to a prediction line centered directly in the middle of noise, resulting in approximately **50% of all future intervals suffering SLA violations**!

---

## 6. Proposed Asymmetric Cost Function Formulation

To resolve this deficiency, we define the directional error:
$$e_i = \hat{y}_i - y_i$$

The custom piecewise exponential-linear asymmetric cost function $\mathcal{L}(e_i)$ is formulated as:
$$\mathcal{L}(e_i) = \begin{cases} 
\alpha \cdot \left(e^{\beta \cdot |e_i|} - 1\right) = \alpha \cdot \left(e^{\beta (y_i - \hat{y}_i)} - 1\right) & \text{if } \hat{y}_i < y_i \quad (\text{Under-prediction / SLA Violation}) \\ 
\gamma \cdot |e_i| = \gamma \cdot (\hat{y}_i - y_i) & \text{if } \hat{y}_i \ge y_i \quad (\text{Over-prediction / Resource Wastage}) 
\end{cases}$$

### Configurable Hyperparameters
- $\alpha > 0$ (Default: `1.0`): Baseline scaling factor governing the severity of SLA penalties.
- $\beta > 0$ (Default: `1.2`): Exponential growth multiplier punishing deep capacity deficits.
- $\gamma > 0$ (Default: `0.5`): Linear penalty multiplier for excess cloud allocation.

When $\hat{y}_i = y_i$, both branches evaluate to $0$, ensuring continuous boundary conditions.

---

## 7. Custom Gradient Descent Optimization & Derivation

The objective function over the training dataset of $N$ observations is:
$$J(\mathbf{w}, b) = \frac{1}{N} \sum_{i=1}^N \mathcal{L}(e_i)$$

### Analytical Partial Derivatives
We first calculate the derivative of the loss with respect to the model prediction $\hat{y}_i$:

$$\frac{\partial \mathcal{L}_i}{\partial \hat{y}_i} = \begin{cases}
-\alpha \beta \cdot e^{\beta (y_i - \hat{y}_i)} & \text{if } \hat{y}_i < y_i \\
\gamma & \text{if } \hat{y}_i \ge y_i
\end{cases}$$

Applying the multivariable chain rule w.r.t parameters $w_j$ and $b$:
$$\frac{\partial J}{\partial w_j} = \frac{1}{N} \sum_{i=1}^N \frac{\partial \mathcal{L}_i}{\partial \hat{y}_i} \frac{\partial \hat{y}_i}{\partial w_j} = \frac{1}{N} \sum_{i=1}^N \frac{\partial \mathcal{L}_i}{\partial \hat{y}_i} x_{ij}$$
$$\frac{\partial J}{\partial b} = \frac{1}{N} \sum_{i=1}^N \frac{\partial \mathcal{L}_i}{\partial \hat{y}_i} \frac{\partial \hat{y}_i}{\partial b} = \frac{1}{N} \sum_{i=1}^N \frac{\partial \mathcal{L}_i}{\partial \hat{y}_i}$$

In vectorized matrix notation:
$$\nabla_{\mathbf{w}} J = \frac{1}{N} \mathbf{X}^T \mathbf{g}, \qquad \nabla_b J = \frac{1}{N} \sum_{i=1}^N g_i$$
where $\mathbf{g} \in \mathbb{R}^N$ is the gradient vector with components $g_i = \frac{\partial \mathcal{L}_i}{\partial \hat{y}_i}$.

### Parameter Updates
For epoch $t=1, 2, \dots, E$ with learning rate $\eta$:
$$\mathbf{w}^{(t+1)} \leftarrow \mathbf{w}^{(t)} - \eta \nabla_{\mathbf{w}} J$$
$$b^{(t+1)} \leftarrow b^{(t)} - \eta \nabla_b J$$

*Numerical Stability*: To prevent IEEE floating-point overflow during early training epochs, exponential arguments are clipped: $\text{clip}(\beta(y_i - \hat{y}_i), -\infty, 8.0)$.

---

## 8. Dataset Architecture & Telemetry Characteristics

The model is trained and evaluated on real-world production cluster telemetry from Zenodo record [14564935](https://zenodo.org/records/14564935):
- **Title**: *DataCenter-Traces-Datasets (Version 2)*
- **Authors**: Alejandro Fernández-Montes & Damián Fernández Cerero (Universidad de Sevilla)
- **DOI**: [10.5281/zenodo.14564935](https://doi.org/10.5281/zenodo.14564935)
- **Primary Source**: Derived from Alibaba Cluster Trace v2018 (`cluster-trace-v2018`), file `machine_usage_days_1_to_8_grouped_300_seconds.csv`.
- **License**: Creative Commons Attribution 4.0 International (CC-BY 4.0).
- **Sampling Interval**: 300 seconds (5 minutes), spanning 8 consecutive days of datacenter telemetry.

The dataset consists of **2,242 consecutive chronological observations** with zero missing values:

| Feature Name | Description | Min | Mean | Median | Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cpu_util_percent` | Host CPU core utilization percentage | 16.13% | 40.18% | 39.37% | 79.07% |
| `mem_util_percent` | Physical RAM memory utilization percentage | 78.26% | 87.97% | 88.17% | 95.02% |
| `net_in` | Normalized inbound network throughput [0, 100] | 34.70 | 41.02 | 40.93 | 47.46 |
| `net_out` | Normalized outbound network throughput [0, 100] | 27.49 | 32.52 | 32.47 | 37.77 |
| `disk_io_percent` | Disk read/write channel saturation percentage | 3.31% | 7.68% | 6.47% | 25.80% |
| **`required_resource_next_5min`** | **Target (Y): Ground-truth future required capacity ($t+1$)** | **78.26%** | **87.97%** | **88.17%** | **95.02%** |

> [!NOTE]
> In this real Alibaba 2018 trace, telemetry values represent the aggregate datacenter-wide utilization across the server fleet. Inbound and outbound network metrics exhibit a stable datacenter-wide egress-to-ingress ratio ($\text{mean} \approx 0.7926 \pm 0.0015$) characteristic of cloud web-tier architectures. The ground-truth prediction target $y_t$ is formed strictly as the real 1-step forward time-shift ($t+1$) of measured memory demand: $y_t = \text{mem\_util\_percent}_{t+1}$.

---

## 9. Feature Engineering & Normalization

Because input features operate on disparate scales (e.g., `cpu_util_percent` spanning 16%–79% while `disk_io_percent` averages 7%), unscaled gradient descent would suffer from severe condition number distortion and oscillating convergence paths.

Standard z-score standardization is applied:
$$z_{ij} = \frac{x_{ij} - \mu_j}{\sigma_j}$$
where $\mu_j$ and $\sigma_j$ denote the empirical mean and standard deviation of feature $j$.

The regression target $y$ (`required_resource_next_5min`) is left unscaled to retain direct percentage capacity interpretability.

---

## 10. Training Methodology & Chronological Leak-Free Split

### Prevention of Temporal Data Leakage
In time-series cloud performance telemetry, adjacent observations exhibit strong autocorrelation. Randomly shuffling data creates severe **lookahead leakage**, where future records contaminate training splits.

Therefore, a strict **chronological partition** is enforced:
- **Training Set**: Earliest 80% of records ($N_{\text{train}} = 1,793$ samples).
- **Test Set**: Latest 20% of records ($N_{\text{test}} = 449$ samples).
- `StandardScaler` is fitted **strictly on the training set** and applied to the test set and real-time inference without leakage.

---

## 11. Academic Evaluation Metrics

In addition to standard statistical regression metrics, specialized cloud operations metrics are computed:

1. **Mean Squared Error (MSE)**: $\frac{1}{N} \sum_{i=1}^N (\hat{y}_i - y_i)^2$
2. **Root Mean Squared Error (RMSE)**: $\sqrt{\text{MSE}}$
3. **Mean Absolute Error (MAE)**: $\frac{1}{N} \sum_{i=1}^N |\hat{y}_i - y_i|$
4. **Coefficient of Determination ($R^2$)**: $1 - \frac{\sum (\hat{y}_i - y_i)^2}{\sum (y_i - \bar{y})^2}$
5. **SLA Violation Rate (%)**:
   $$\text{SLA Violation Rate} = \frac{\sum_{i=1}^N \mathbb{I}(\hat{y}_i < y_i)}{N} \times 100\%$$
6. **Resource Wastage Index**:
   $$\text{Resource Wastage Index} = \frac{1}{N} \sum_{i=1}^N \max(0, \hat{y}_i - y_i)$$
7. **Under-Prediction Count**: $\sum \mathbb{I}(\hat{y}_i < y_i)$
8. **Over-Prediction Count**: $\sum \mathbb{I}(\hat{y}_i \ge y_i)$

---

## 12. Baseline vs. Proposed Model: Empirical Results

All metrics below are computed on the 449 held-out chronological test records:

| Evaluation Metric | Baseline OLS (MSE) | Proposed Asymmetric Cost Model | Empirical Impact ($\Delta$) |
| :--- | :--- | :--- | :--- |
| **SLA Violation Rate (%)** | **53.23%** | **15.81%** | **-37.42% absolute reduction (-70.3% relative drop)** |
| **SLA Violation Count** | **239 / 449 intervals** | **71 / 449 intervals** | **168 fewer SLA breaches** |
| **SLA Deficit Severity** | 1.1551 units | 0.8384 units | -0.3167 units lower breach depth |
| **Resource Wastage Index** | 0.5637 units | 1.7558 units | +1.192 units controlled buffer |
| **Over-Provisioning Count** | 210 / 449 intervals | 378 / 449 intervals | +168 intervals protected |
| **Mean Squared Error (MSE)** | 2.1490 | 5.3231 | Expected trade-off |
| **Learned Intercept ($b$)** | 87.5873 | 89.5920 | +2.00% upward safety headroom |

### Analytical Conclusion
The baseline OLS model causes SLA breaches in over half of all operating windows (53.23%) because symmetric loss seeks the median. In contrast, our asymmetric model learns an optimal upward safety buffer, slashing SLA violations down to 15.81% (a 70.3% relative drop), effectively protecting service quality with an acceptable resource buffer of +1.192 units.

---

## 13. Simulated Auto-Scaling Decision Engine

Following prediction of $\hat{y}$ for the upcoming 5-minute horizon, the advisory auto-scaling decision engine compares $\hat{y}$ against current server load baseline $C_{\text{curr}} = \max(\text{CPU}, \text{Mem})$:

$$\Delta = \hat{y} - C_{\text{curr}}$$

### Decision Rules
- **`SCALE_UP`**: Triggered when $\Delta > +5.0\%$ (predicted demand significantly exceeds current capacity; scale out before SLA violation occurs).
- **`SCALE_DOWN`**: Triggered when $\Delta < -15.0\%$ (predicted demand reveals large surplus capacity; scale in to reduce financial expenditure).
- **`MAINTAIN`**: Triggered when $-15.0\% \le \Delta \le +5.0\%$ (system is operating within safe, balanced headroom corridor).

*Academic Note*: This decision logic produces advisory simulated recommendations for empirical validation and does not issue direct API calls to commercial cloud hypervisors.

---

## 14. Academic Prototype Limitations

1. **Simulated Actuation**: The prototype simulates auto-scaling recommendations; it does not interface directly with AWS Auto Scaling or Kubernetes HPA APIs.
2. **Stationarity Assumption**: Assumes telemetry distributions remain stationary over the observation horizon; concept drift over multi-month intervals requires continuous model retraining.
3. **Linearity of the Model**: While the cost function is nonlinear (exponential-linear), the underlying hypothesis $\mathbf{w}^T \mathbf{x} + b$ is multivariable linear. Highly nonlinear workload interactions could benefit from kernelization or deep neural networks.

---

## 15. Future Research Scope

1. **Nonlinear Neural Architectures**: Formulating asymmetric loss functions for recurrent neural networks (LSTMs, GRUs) and Temporal Fusion Transformers (TFT).
2. **Multi-Horizon Forecasting**: Simultaneous forecasting across 5-min, 15-min, and 60-min horizons.
3. **Reinforcement Learning Integration**: Combining asymmetric regression outputs with deep Q-learning or PPO to optimize dynamic scaling step sizes.
4. **Cloud Cost Calibration**: Calibrating $\gamma$ directly against real-world AWS spot/on-demand instance pricing tables.

---

## 16. System Architecture & Execution Guide

### Architecture Overview
```
CSV Telemetry (2,242 rows)
       ↓
Data Preprocessing & Validation
       ↓
Chronological 80/20 Train/Test Split
       ↓
StandardScaler (Fitted on Train Only)
       ↓
Custom Asymmetric Loss Formulation: L(e) = α(exp(β|e|) - 1) vs γ|e|
       ↓
Analytical Gradient Descent Loop (NumPy)
       ↓
Next-5-Minute Demand Prediction
       ↓
Simulated Auto-Scaling Decision Engine (SCALE_UP / MAINTAIN / SCALE_DOWN)
       ↓
FastAPI Backend (REST API on port 8000) & SQLite Persistence
       ↓
React + TypeScript + Tailwind CSS + Recharts Academic Dashboard (port 5173)
```

### Installation & Execution

#### 1. Backend Setup
```bash
# Ensure Python 3.10+ is installed
python --version

# Install dependencies
pip install -r requirements.txt

# Run unit and API tests
python -m pytest backend/tests/ -v

# Start FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger API documentation will be available at `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Run Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
Open `http://127.0.0.1:5173/` in any modern web browser.
