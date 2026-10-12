import joblib
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from Backend.Feature_Engineering.functions import (combine, lower, remove_numbers, emoji_is, remove_words, remove_punc)
from fastapi.middleware.cors import CORSMiddleware


class NewsData(BaseModel):
    text: str
    title: str
    subject: str


vectorizer = joblib.load("./Preprocessor/bow_vectorizer.pkl")
model = joblib.load("./Preprocessor/model.pkl")
cm_matrix = pd.read_csv("./Processed_Data/cm_table.csv")
cm_table = pd.read_csv("./Processed_Data/comparison_table.csv")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Fake news API is running"
    }


@app.post("/predict")
def predict_news(payload: NewsData):
    text = payload.text
    title = payload.title
    subject = payload.subject
    
    final_text = combine(text, title, subject)
    final_text = lower(final_text)
    final_text = remove_punc(final_text)
    final_text = remove_numbers(final_text)
    final_text = emoji_is(final_text)
    final_text = remove_words(final_text)

    final_text = vectorizer.transform([final_text])
    predict = model.predict(final_text)

    probabilities = model.predict_proba(final_text)[0]
    confidence = max(probabilities) * 100

    return {
        "Prediction": int(predict[0]),
        "Confidence_Score": confidence
    }


@app.get("/confusion_matrix")
def matrix():
    return cm_matrix.to_dict(orient="records")


@app.get("/confusion_table")
def table():
    return cm_table.to_dict(orient="records")