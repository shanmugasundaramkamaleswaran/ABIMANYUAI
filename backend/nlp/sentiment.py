from textblob import TextBlob
def analyze_sentiment(text:str)->str:
    blob=TextBlob(text)
    polarity=blob.sentiment.polarity
    if polarity<-0.3:
        return "negative"
    elif polarity>0.3:
        return "positive"
    else:
        return "neutral"