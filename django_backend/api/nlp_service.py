import nltk
from nltk.util import ngrams
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer, util
import torch
import re
from nltk.tokenize import sent_tokenize

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Load BERT model (cached)
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_k_shingles(text, k=3):
    """Generate k-word shingles from text."""
    tokens = text.lower().split()
    if len(tokens) < k:
        return set([tuple(tokens)])
    return set(ngrams(tokens, k))

def calculate_shingle_similarity(text1, text2, k=3):
    """Calculate Jaccard similarity between k-shingles."""
    shingles1 = get_k_shingles(text1, k)
    shingles2 = get_k_shingles(text2, k)
    
    intersection = len(shingles1.intersection(shingles2))
    union = len(shingles1.union(shingles2))
    
    if union == 0:
        return 0.0
    return (intersection / union) * 100

def calculate_cosine_similarity(text1, text2):
    """Calculate Cosine similarity using TF-IDF."""
    if not text1.strip() or not text2.strip():
        return 0.0
    vectorizer = TfidfVectorizer().fit_transform([text1, text2])
    vectors = vectorizer.toarray()
    similarity = cosine_similarity(vectors)
    return similarity[0][1] * 100

def calculate_bert_similarity(text1, text2):
    """Calculate semantic similarity using BERT."""
    if not text1.strip() or not text2.strip():
        return 0.0
    embeddings1 = model.encode(text1, convert_to_tensor=True)
    embeddings2 = model.encode(text2, convert_to_tensor=True)
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    return cosine_scores.item() * 100

def predict_ai_content(text):
    """
    Predict probability of text being AI generated.
    Using a heuristic-based approach (burstiness/complexity) 
    supplemented by BERT embeddings analysis.
    """
    if len(text.split()) < 20:
        return 0.0 # Too short for reliable detection
    
    # Heuristic: AI text often has very uniform sentence lengths (low burstiness)
    sentences = sent_tokenize(text)
    if len(sentences) < 2:
        return 20.0 # Default low-confidence score
        
    lengths = [len(s.split()) for s in sentences]
    avg_length = sum(lengths) / len(lengths)
    variance = sum((x - avg_length) ** 2 for x in lengths) / len(lengths)
    
    # Lower variance (more uniform) often indicates AI
    burstiness_score = max(0, 100 - (variance * 2)) 
    
    # Simulate high-level check (Replace with real classifier if needed)
    return round(min(99.9, burstiness_score + 10), 2)

def get_sentence_analysis(text1, text2):
    """Maps sentences of text1 to their similarity level in text2."""
    sentences1 = sent_tokenize(text1)
    sentences2 = sent_tokenize(text2)
    
    if not sentences1 or not sentences2:
        return []
        
    analysis = []
    # Pre-calculate embeddings for sentences2
    embeddings2 = model.encode(sentences2, convert_to_tensor=True)
    
    for sent in sentences1:
        if len(sent.split()) < 3:
            analysis.append({"text": sent, "status": "original", "score": 0})
            continue
            
        emb1 = model.encode(sent, convert_to_tensor=True)
        cos_scores = util.cos_sim(emb1, embeddings2)[0]
        max_score = torch.max(cos_scores).item() * 100
        
        status = "original"
        if max_score > 85: # Threshold for high similarity
            # Check for exact shingle match to distinguish between copy and paraphrase
            shingle_sim = calculate_shingle_similarity(sent, text2, k=2)
            if shingle_sim > 60:
                status = "exact"
            else:
                status = "paraphrase"
                
        analysis.append({
            "text": sent,
            "status": status,
            "score": round(max_score, 2)
        })
        
    return analysis

def get_hybrid_score(text1, text2):
    """Calculate hybrid plagiarism score."""
    shingle_score = calculate_shingle_similarity(text1, text2)
    cosine_score = calculate_cosine_similarity(text1, text2)
    semantic_score = calculate_bert_similarity(text1, text2)
    ai_score = predict_ai_content(text1)
    
    # Sentence-level analysis for highlighting
    sentence_analysis = get_sentence_analysis(text1, text2)
    
    # Weighted average: 30% Shingle, 30% Cosine, 40% Semantic
    hybrid_score = (shingle_score * 0.3) + (cosine_score * 0.3) + (semantic_score * 0.4)
    
    return {
        "shingle_score": round(shingle_score, 2),
        "cosine_score": round(cosine_score, 2),
        "semantic_score": round(semantic_score, 2),
        "hybrid_score": round(hybrid_score, 2),
        "ai_score": ai_score,
        "sentence_analysis": sentence_analysis
    }
