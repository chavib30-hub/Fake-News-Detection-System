# removing punctuations
import string
import nltk 
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
stop_words = set(stopwords.words("english"))
def combine(txt1,txt2,txt3):
       return (
        txt1.astype(str) + " " + txt2.astype(str) + " " + txt3.astype(str)
        if hasattr(txt1, "astype")
        else str(txt1) + " " + str(txt2) + " " + str(txt3)
    )

def lower(txt):
    return txt.lower()

def remove_punc(txt):
    return txt.translate(str.maketrans('', '', string.punctuation))


# removing digits 
def remove_numbers(txt):
    new = ""
    for i in txt:
        if not i.isdigit():
            new +=i
    return new  


# removing emojis 
def emoji_is(txt):
    new =""
    for i in txt:
        if i.isascii():
            new +=i
    return new   

# Removing stopwords
def remove_words(txt):
    words =  txt.split()
    n = []
    for i in words :
        if not i  in stop_words:
            n.append(i)
    return ' '.join(n) 