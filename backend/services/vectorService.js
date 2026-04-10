const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class VectorService {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'data', 'gita_vector_db.json');
        this.db = [];
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.embedModel = this.genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        this.loadDb();
    }

    loadDb() {
        if (fs.existsSync(this.dbPath)) {
            try {
                this.db = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
                console.log(`[VectorDB] Loaded ${this.db.length} chunks.`);
            } catch (e) {
                console.error('[VectorDB] Error loading DB:', e.message);
            }
        } else {
            console.warn('[VectorDB] Database file not found. Please run the indexer.');
        }
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async search(query, k = 5, excludeIds = [], temperature = 0.5) {
        if (this.db.length === 0) {
            this.loadDb();
            if (this.db.length === 0) return null;
        }

        console.log(`[VectorDB] Searching for: "${query}" (temp: ${temperature})`);
        
        try {
            const res = await this.embedModel.embedContent(query);
            const queryEmbedding = res.embedding.values;

            const scores = this.db.map(item => ({
                id: item.id,
                text: item.text,
                score: this.cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Filter out excluded IDs
            const filteredScores = scores.filter(s => !excludeIds.includes(s.id));
            
            // Sort by score descending
            filteredScores.sort((a, b) => b.score - a.score);

            // Take top N (say top 10)
            const topN = filteredScores.slice(0, 10);
            
            if (topN.length === 0) return null;

            // Randomized outcome based on temperature
            // Temperature 0: Always pick top 1
            // Temperature 1: More random among top N
            let selectedIndex = 0;
            if (temperature > 0) {
                // Simple randomization: pick from top K based on temperature
                const poolSize = Math.max(1, Math.min(topN.length, Math.ceil(temperature * 10)));
                selectedIndex = Math.floor(Math.random() * poolSize);
            }

            const result = topN[selectedIndex];
            console.log(`[VectorDB] Found relevant verse: ${result.id} (Score: ${result.score.toFixed(4)})`);
            
            return result;
        } catch (e) {
            console.error('[VectorDB] Search error:', e.message);
            return null;
        }
    }
}

module.exports = new VectorService();
