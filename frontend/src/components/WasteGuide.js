import React, { useState, useRef } from 'react';
import { 
  Camera, Search, Upload, X, CheckCircle, 
  AlertCircle, Leaf, Recycle, Smartphone, 
  AlertTriangle, Lightbulb, Info, Sparkles
} from 'lucide-react';
import './WasteGuide.css';

const WasteGuide = () => {
  const [activeTab, setActiveTab] = useState('camera'); // camera, search, browse
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Waste categories with detailed info
  const wasteCategories = {
    biodegradable: {
      icon: <Leaf size={32} />,
      color: '#4caf50',
      title: 'Biodegradable Waste',
      description: 'Organic waste that decomposes naturally',
      examples: [
        { name: 'Food Scraps', disposal: 'Compost or green bin', time: '2-4 weeks' },
        { name: 'Garden Waste', disposal: 'Compost heap', time: '3-6 months' },
        { name: 'Paper Products', disposal: 'Composting or recycling', time: '2-6 weeks' },
        { name: 'Vegetable Peels', disposal: 'Compost bin', time: '1-2 weeks' },
        { name: 'Tea Bags', disposal: 'Compost bin', time: '3-6 months' },
        { name: 'Coffee Grounds', disposal: 'Compost or garden', time: '2-3 months' }
      ],
      tips: [
        'Keep separate from other waste',
        'Use compost bins for home processing',
        'Avoid oils and meat in compost',
        'Turn compost regularly for faster decomposition'
      ]
    },
    recyclable: {
      icon: <Recycle size={32} />,
      color: '#2196f3',
      title: 'Recyclable Waste',
      description: 'Materials that can be processed and reused',
      examples: [
        { name: 'Plastic Bottles', disposal: 'Blue recycling bin', recyclable: 'Yes - PET' },
        { name: 'Glass Bottles', disposal: 'Glass recycling', recyclable: 'Yes - Infinite' },
        { name: 'Cardboard', disposal: 'Paper recycling', recyclable: 'Yes - 5-7 times' },
        { name: 'Aluminum Cans', disposal: 'Metal recycling', recyclable: 'Yes - Infinite' },
        { name: 'Newspapers', disposal: 'Paper recycling', recyclable: 'Yes - 5-7 times' },
        { name: 'Steel Cans', disposal: 'Metal recycling', recyclable: 'Yes - Infinite' }
      ],
      tips: [
        'Clean items before recycling',
        'Remove caps and labels when possible',
        'Flatten cardboard boxes',
        'Check recycling symbols on packaging'
      ]
    },
    ewaste: {
      icon: <Smartphone size={32} />,
      color: '#ff9800',
      title: 'Electronic Waste',
      description: 'Electronic devices and components',
      examples: [
        { name: 'Mobile Phones', disposal: 'E-waste collection center', hazard: 'Battery leakage' },
        { name: 'Laptops', disposal: 'Authorized recycler', hazard: 'Heavy metals' },
        { name: 'Batteries', disposal: 'Battery collection box', hazard: 'Toxic chemicals' },
        { name: 'Chargers', disposal: 'E-waste drop-off', hazard: 'Copper wiring' },
        { name: 'LED Bulbs', disposal: 'Hazardous waste facility', hazard: 'Mercury traces' },
        { name: 'Printers', disposal: 'E-waste recycler', hazard: 'Ink cartridges' }
      ],
      tips: [
        'Never throw in regular trash',
        'Remove personal data from devices',
        'Store in dry place until disposal',
        'Take to certified e-waste collectors'
      ]
    },
    hazardous: {
      icon: <AlertTriangle size={32} />,
      color: '#f44336',
      title: 'Hazardous Waste',
      description: 'Dangerous materials requiring special handling',
      examples: [
        { name: 'Paint Cans', disposal: 'Hazardous waste facility', danger: 'Toxic fumes' },
        { name: 'Pesticides', disposal: 'Special collection', danger: 'Poisonous' },
        { name: 'Cleaning Chemicals', disposal: 'Hazardous waste center', danger: 'Corrosive' },
        { name: 'Motor Oil', disposal: 'Oil recycling center', danger: 'Soil contamination' },
        { name: 'Medical Waste', disposal: 'Medical waste disposal', danger: 'Biohazard' },
        { name: 'CFL Bulbs', disposal: 'Hazardous waste facility', danger: 'Mercury' }
      ],
      tips: [
        'Never pour down drains',
        'Keep in original containers',
        'Store away from children',
        'Contact local authorities for disposal'
      ]
    }
  };

  // Simulated AI Classification (In production, this would call TensorFlow.js model)
  const classifyImage = async (imageFile) => {
    setClassifying(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated classification results
    const possibleResults = [
      { category: 'biodegradable', item: 'Food Scraps', confidence: 92 },
      { category: 'recyclable', item: 'Plastic Bottle', confidence: 95 },
      { category: 'ewaste', item: 'Mobile Phone', confidence: 88 },
      { category: 'hazardous', item: 'Paint Can', confidence: 85 }
    ];

    const result = possibleResults[Math.floor(Math.random() * possibleResults.length)];
    
    setClassification({
      ...result,
      categoryInfo: wasteCategories[result.category],
      timestamp: new Date()
    });

    setClassifying(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        classifyImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Search through all waste items
    const results = [];
    Object.entries(wasteCategories).forEach(([category, data]) => {
      data.examples.forEach(item => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            ...item,
            category,
            categoryInfo: data
          });
        }
      });
    });

    setSearchResults(results);
  };

  const resetClassification = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setClassification(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const CategoryCard = ({ categoryKey, data }) => (
    <div 
      className="category-card"
      style={{ borderColor: data.color }}
      onClick={() => setSelectedItem({ category: categoryKey, ...data })}
    >
      <div className="category-icon" style={{ color: data.color }}>
        {data.icon}
      </div>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <button 
        className="view-btn"
        style={{ background: data.color }}
      >
        View Items
      </button>
    </div>
  );

  return (
    <div className="waste-guide-container">
      {/* Header */}
      <div className="guide-header">
        <div className="header-content">
          <h2 className="guide-title">
            <Sparkles size={28} />
            Smart Waste Guide
          </h2>
          <p className="guide-subtitle">
            Identify waste with AI or search our comprehensive database
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <Camera size={20} />
          AI Classification
        </button>
        <button
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={20} />
          Search Database
        </button>
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <Info size={20} />
          Browse Categories
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* AI Classification Tab */}
        {activeTab === 'camera' && (
          <div className="camera-section">
            {!imagePreview ? (
              <div className="upload-area">
                <div className="upload-content">
                  <Camera size={64} className="upload-icon" />
                  <h3>Identify Waste with AI</h3>
                  <p>Take a photo or upload an image to classify waste type</p>
                  
                  <div className="upload-buttons">
                    <button
                      className="upload-btn camera-btn"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera size={20} />
                      Take Photo
                    </button>
                    <button
                      className="upload-btn file-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} />
                      Upload Image
                    </button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="info-boxes">
                  <div className="info-box">
                    <Lightbulb size={20} />
                    <p>Ensure good lighting for better accuracy</p>
                  </div>
                  <div className="info-box">
                    <Camera size={20} />
                    <p>Focus on the waste item clearly</p>
                  </div>
                  <div className="info-box">
                    <CheckCircle size={20} />
                    <p>85%+ accuracy guaranteed</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="classification-result">
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Uploaded waste" className="preview-image" />
                  <button className="reset-btn" onClick={resetClassification}>
                    <X size={20} />
                  </button>
                </div>

                {classifying ? (
                  <div className="classifying-loader">
                    <div className="ai-spinner"></div>
                    <h3>Analyzing image...</h3>
                    <p>Our AI is identifying the waste type</p>
                  </div>
                ) : classification && (
                  <div className="classification-details">
                    <div className="result-header">
                      <CheckCircle size={32} className="success-icon" />
                      <h3>Classification Complete!</h3>
                      <div className="confidence-badge">
                        {classification.confidence}% Confident
                      </div>
                    </div>

                    <div className="result-card" style={{ borderColor: classification.categoryInfo.color }}>
                      <div className="result-icon" style={{ color: classification.categoryInfo.color }}>
                        {classification.categoryInfo.icon}
                      </div>
                      <h4>{classification.item}</h4>
                      <span className="category-name">{classification.categoryInfo.title}</span>
                      
                      <div className="disposal-info">
                        <h5>How to Dispose:</h5>
                        <p>{classification.categoryInfo.description}</p>
                        
                        <div className="tips-list">
                          <strong>Quick Tips:</strong>
                          <ul>
                            {classification.categoryInfo.tips.slice(0, 3).map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button className="try-again-btn" onClick={resetClassification}>
                      Try Another Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for any waste item... (e.g., plastic bottle, batteries)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => handleSearch('')}>
                  <X size={18} />
                </button>
              )}
            </div>

            {searchQuery.length === 0 ? (
              <div className="search-placeholder">
                <Search size={64} className="placeholder-icon" />
                <h3>Start Searching</h3>
                <p>Type any waste item to find proper disposal methods</p>
                <div className="example-searches">
                  <span>Try: </span>
                  <button onClick={() => handleSearch('plastic')}>Plastic</button>
                  <button onClick={() => handleSearch('battery')}>Battery</button>
                  <button onClick={() => handleSearch('paper')}>Paper</button>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="no-results">
                <AlertCircle size={48} />
                <h3>No results found</h3>
                <p>Try different keywords or browse categories</p>
              </div>
            ) : (
              <div className="search-results">
                <p className="results-count">{searchResults.length} items found</p>
                <div className="results-grid">
                  {searchResults.map((item, idx) => (
                    <div key={idx} className="result-item" style={{ borderLeftColor: item.categoryInfo.color }}>
                      <div className="result-item-header">
                        <span className="result-icon" style={{ color: item.categoryInfo.color }}>
                          {item.categoryInfo.icon}
                        </span>
                        <div>
                          <h4>{item.name}</h4>
                          <span className="result-category">{item.categoryInfo.title}</span>
                        </div>
                      </div>
                      <div className="result-details">
                        <p><strong>Disposal:</strong> {item.disposal}</p>
                        {item.recyclable && <p><strong>Recyclable:</strong> {item.recyclable}</p>}
                        {item.time && <p><strong>Decomposition:</strong> {item.time}</p>}
                        {item.hazard && <p className="hazard-warning">⚠️ {item.hazard}</p>}
                        {item.danger && <p className="danger-warning">🚫 {item.danger}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Browse Categories Tab */}
        {activeTab === 'browse' && (
          <div className="browse-section">
            {!selectedItem ? (
              <div className="categories-grid">
                {Object.entries(wasteCategories).map(([key, data]) => (
                  <CategoryCard key={key} categoryKey={key} data={data} />
                ))}
              </div>
            ) : (
              <div className="category-details">
                <button className="back-btn" onClick={() => setSelectedItem(null)}>
                  ← Back to Categories
                </button>

                <div className="category-detail-header" style={{ borderColor: selectedItem.color }}>
                  <div className="detail-icon" style={{ color: selectedItem.color }}>
                    {selectedItem.icon}
                  </div>
                  <h2>{selectedItem.title}</h2>
                  <p>{selectedItem.description}</p>
                </div>

                <div className="items-list">
                  <h3>Common Items</h3>
                  <div className="items-grid">
                    {selectedItem.examples.map((item, idx) => (
                      <div key={idx} className="item-card">
                        <h4>{item.name}</h4>
                        <p><strong>Disposal:</strong> {item.disposal}</p>
                        {item.recyclable && <p><strong>Recyclable:</strong> {item.recyclable}</p>}
                        {item.time && <p><strong>Time:</strong> {item.time}</p>}
                        {item.hazard && <p className="warning-text">⚠️ {item.hazard}</p>}
                        {item.danger && <p className="danger-text">🚫 {item.danger}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tips-section">
                  <h3>💡 Best Practices</h3>
                  <div className="tips-grid">
                    {selectedItem.tips.map((tip, idx) => (
                      <div key={idx} className="tip-card">
                        <CheckCircle size={18} />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteGuide;