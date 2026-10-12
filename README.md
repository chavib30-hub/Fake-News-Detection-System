# 🔍 Truth Check – Fake News Detector

Truth Check is an end-to-end Machine Learning web application designed to classify news articles as **Real** or **Fake**. Built with a **FastAPI** backend and a responsive **HTML5/JS** frontend, the application provides real-time predictions, classification history, visual model dashboards, and performance reports.

---

## ✨ Features

- **Real-time News Analysis:** Accepts article **Title**, **Subject**, and **Text** to compute prediction results and confidence scores.
- **Interactive History Log:** Saves checks locally in a searchable tabular format with single-click inspection.
- **Visual Analytics Dashboard:** Visualizes prediction metrics using interactive KPI cards and SVG distribution charts.
- **Detailed Performance Reports:** Displays dataset train/test splits (80% / 20%), Confusion Matrices, and Model Comparison metrics.
- **Export Capabilities:** Export full query history as a `.csv` file or generate print-friendly PDF summaries.
- **Responsive & Dynamic UI:** Built with dark/light theme toggling and full mobile responsiveness.

---

## 🛠️ Tech Stack

### **Backend**
- **Python 3.9+**
- **FastAPI** – High-performance Web Framework
- **scikit-learn / joblib** – Model deployment & vectorization
- **Pandas** – Data handling & CSV reading
- **Uvicorn** – ASGI Server

### **Frontend**
- **HTML5 & CSS3** (Vanilla CSS with CSS Variables)
- **JavaScript (ES6+)** – Async `fetch` API, DOM manipulation, SVG chart rendering

### **Machine Learning Pipeline**
- **Feature Extractor:** Bag of Words (`bow_vectorizer.pkl`)
- **Classifier:** Logistic Regression (`model.pkl`)
- **Train/Test Split:** 80% Training Data / 20% Testing Data

---

## 📁 Project Directory Structure

```text
truth-check/
│
├── main.py                    # FastAPI server & endpoints
├── index.html                 # Main frontend interface
├── script.js                  # Frontend logic, charts & API integrations
├── style.css                  # UI styling & theme variables
│
├── Feature_Engineering/
│   └── functions.py           # Text preprocessing functions (lower, remove_punc, etc.)
│
├── Preprocessor/
│   ├── bow_vectorizer.pkl     # Fitted Bag of Words CountVectorizer
│   └── model.pkl              # Trained Logistic Regression model
│
└── Processed_Data/
    ├── cm_table.csv           # Confusion matrix data
    └── comparison_table.csv    # Model performance metrics data