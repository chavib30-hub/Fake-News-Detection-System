🔍 Truth Check – Fake News Detector

Truth Check is an end-to-end Machine Learning web application designed to classify news articles as Real or Fake. Built with a FastAPI backend and a responsive HTML5/CSS3/JavaScript frontend, the application provides real-time predictions, classification history, visual model dashboards, and detailed performance reports.

📂 Project Directory Structure

truth-check/
│
├── Backend/
│   ├── Feature_Engineering/
│   │   └── functions.py           # Text preprocessing utilities
│   ├── Preprocessor/
│   │   ├── bow_vectorizer.pkl     # Fitted Bag of Words CountVectorizer
│   │   └── model.pkl              # Trained Logistic Regression model
│   ├── Processed_Data/
│   │   ├── cm_table.csv           # Confusion matrix data
│   │   └── comparison_table.csv   # Model performance metrics data
│   ├── file.ipynb                 # Jupyter Notebook for EDA & model training
│   └── main.py                    # FastAPI server & endpoints
│
├── Frontend/
│   ├── index.html                 # Main user interface
│   ├── script.js                  # Async API requests, charts & UI logic
│   └── style.css                  # UI styling & dynamic themes
│
└── README.md                      # Project documentation


✨ Features

Real-time News Analysis: Accepts article Title, Subject, and Text to compute prediction results and confidence scores.

Interactive History Log: Saves checks locally in a searchable tabular format with single-click inspection.

Visual Analytics Dashboard: Visualizes prediction metrics using interactive KPI cards and custom SVG distribution charts.

Detailed Performance Reports: Displays dataset train/test splits (80% / 20%), Confusion Matrices, and Model Comparison metrics.

Export Capabilities: Export full query history as a .csv file or generate print-friendly PDF summaries.

Responsive & Dynamic UI: Built with dark/light theme toggling and full mobile responsiveness.

🛠️ Tech Stack

Backend

Python 3.9+

FastAPI – High-performance Web Framework

scikit-learn / joblib – Model deployment & vectorization

Pandas – Data handling & CSV reading

Uvicorn – ASGI Server

Frontend

HTML5 & CSS3 (Vanilla CSS with CSS Variables)

JavaScript (ES6+) – Async fetch API, DOM manipulation, SVG chart rendering

Machine Learning Pipeline

Feature Extractor: Bag of Words (bow_vectorizer.pkl)

Classifier: Logistic Regression (model.pkl)

Train/Test Split: 80% Training Data / 20% Testing Data

📊 Dataset Resources

Raw datasets used for model training and experimentation:

📄 Fake News Dataset: Download Fake.csv

📄 Real News Dataset: Download True.csv

(Note: Raw dataset files are stored externally on Google Drive and are not tracked inside the repository).

🚀 Getting Started

1. Clone the Repository

git clone https://github.com/chavib30-hub/truth-check.git
cd truth-check


2. Set Up & Run the Backend

Navigate to the Backend/ directory, set up a virtual environment, install dependencies, and launch FastAPI:

cd Backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn scikit-learn pandas joblib

# Start the server
uvicorn main:app --reload


The server will start at http://127.0.0.1:8000.

3. Run the Frontend

Open Frontend/index.html directly in your web browser, or serve it using a local static server like VS Code's Live Server extension.

👤 Author

chavib30-hub – GitHub Profile
