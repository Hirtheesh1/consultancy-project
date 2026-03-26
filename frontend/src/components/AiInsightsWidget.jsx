import { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, Loader2 } from 'lucide-react';

const AiInsightsWidget = () => {
    const [insightsList, setInsightsList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.get('/reports/ai-insights');
                const text = res.data.insights || 'No insights available at this time.';
                // Split the text into sentences for sliding if the AI returns multiple points
                const list = text.match(/[^.!?]+[.!?]+/g) || [text];
                const cleanList = list.map(t => t.trim()).filter(t => t.length > 0);
                
                setInsightsList(cleanList.length > 0 ? cleanList : ['No insights available.']);
            } catch (error) {
                console.error('Error fetching AI insights:', error);
                setInsightsList(['Unable to load AI insights. Check your network or API KEY.']);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    // Timer for sliding
    useEffect(() => {
        if (insightsList.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % insightsList.length);
        }, 5000); // Change insight every 5 seconds
        
        return () => clearInterval(interval);
    }, [insightsList]);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                    <Sparkles size={24} color="#a78bfa" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>AI Dashboard Insights</h3>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1, minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                        <Loader2 size={20} className="spinner" />
                        <span>Analyzing today's data...</span>
                    </div>
                ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '2rem' }}>
                        {insightsList.map((insight, index) => (
                            <p 
                                key={index} 
                                style={{ 
                                    margin: 0, 
                                    fontSize: '1.05rem', 
                                    lineHeight: '1.6', 
                                    color: '#f1f5f9',
                                    position: index === currentIndex ? 'relative' : 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    opacity: index === currentIndex ? 1 : 0,
                                    transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.5s ease-in-out',
                                    pointerEvents: index === currentIndex ? 'auto' : 'none',
                                    visibility: index === currentIndex ? 'visible' : 'hidden'
                                }}
                            >
                                {insight}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiInsightsWidget;
