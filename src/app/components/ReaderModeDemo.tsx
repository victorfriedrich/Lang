import React, { useState, useEffect, useRef } from 'react';

// Mock data for the article content
const articleData = {
  title: "La importancia del aprendizaje de idiomas",
  paragraphs: [
    [
      { id: "101", text: "En", unknown: false },
      { id: "102", text: "el", unknown: false },
      { id: "103", text: "mundo", unknown: false },
      { id: "104", text: "globalizado", unknown: false },
      { id: "105", text: "de", unknown: false },
      { id: "106", text: "hoy", unknown: false },
      { id: "107", text: ",", unknown: false },
      { id: "108", text: "el", unknown: false },
      { id: "109", text: "dominio", unknown: true },
      { id: "110", text: "de", unknown: false },
      { id: "111", text: "varios", unknown: true },
      { id: "112", text: "idiomas", unknown: false },
      { id: "113", text: "se", unknown: false },
      { id: "114", text: "ha", unknown: false },
      { id: "115", text: "convertido", unknown: true },
      { id: "116", text: "en", unknown: false },
      { id: "117", text: "una", unknown: false },
      { id: "118", text: "habilidad", unknown: true },
      { id: "119", text: "esencial", unknown: true },
      { id: "120", text: ".", unknown: false },
      { id: "121", text: "Los", unknown: false },
      { id: "122", text: "beneficios", unknown: true },
      { id: "123", text: "del", unknown: false },
      { id: "124", text: "aprendizaje", unknown: true },
      { id: "125", text: "de", unknown: false },
      { id: "126", text: "idiomas", unknown: false },
      { id: "127", text: "van", unknown: false },
      { id: "128", text: "más", unknown: true },
      { id: "129", text: "allá", unknown: true },
      { id: "130", text: "de", unknown: false },
      { id: "131", text: "la", unknown: false },
      { id: "132", text: "simple", unknown: true },
      { id: "133", text: "comunicación", unknown: true },
      { id: "134", text: ".", unknown: false },
    ],
    [
      { id: "135", text: "Los", unknown: false },
      { id: "136", text: "estudios", unknown: true },
      { id: "137", text: "han", unknown: false },
      { id: "138", text: "demostrado", unknown: true },
      { id: "139", text: "que", unknown: false },
      { id: "140", text: "aprender", unknown: true },
      { id: "141", text: "un", unknown: false },
      { id: "142", text: "nuevo", unknown: false },
      { id: "143", text: "idioma", unknown: false },
      { id: "144", text: "mejora", unknown: true },
      { id: "145", text: "la", unknown: false },
      { id: "146", text: "memoria", unknown: true },
      { id: "147", text: ",", unknown: false },
      { id: "148", text: "aumenta", unknown: true },
      { id: "149", text: "la", unknown: false },
      { id: "150", text: "capacidad", unknown: true },
      { id: "151", text: "de", unknown: false },
      { id: "152", text: "resolución", unknown: true },
      { id: "153", text: "de", unknown: false },
      { id: "154", text: "problemas", unknown: true },
      { id: "155", text: "y", unknown: false },
      { id: "156", text: "fortalece", unknown: true },
      { id: "157", text: "las", unknown: false },
      { id: "158", text: "habilidades", unknown: true },
      { id: "159", text: "cognitivas", unknown: true },
      { id: "160", text: "en", unknown: false },
      { id: "161", text: "general", unknown: true },
      { id: "162", text: ".", unknown: false },
    ],
    [
      { id: "163", text: "Además", unknown: false },
      { id: "164", text: ",", unknown: false },
      { id: "165", text: "el", unknown: false },
      { id: "166", text: "conocimiento", unknown: true },
      { id: "167", text: "de", unknown: false },
      { id: "168", text: "otros", unknown: false },
      { id: "169", text: "idiomas", unknown: false },
      { id: "170", text: "abre", unknown: true },
      { id: "171", text: "puertas", unknown: true },
      { id: "172", text: "a", unknown: false },
      { id: "173", text: "nuevas", unknown: true },
      { id: "174", text: "culturas", unknown: true },
      { id: "175", text: ",", unknown: false },
      { id: "176", text: "perspectivas", unknown: true },
      { id: "177", text: "y", unknown: false },
      { id: "178", text: "oportunidades", unknown: true },
      { id: "179", text: "profesionales", unknown: true },
      { id: "180", text: ".", unknown: false },
    ]
  ]
};

// Mock translations data
const translations = {
  "mundo": [
    { text: "world", confidence: "high" },
    { text: "universe, realm", confidence: "medium" }
  ],
  "globalizado": [
    { text: "globalized", confidence: "high" }
  ],
  "hoy": [
    { text: "today", confidence: "high" }
  ],
  "dominio": [
    { text: "mastery, command", confidence: "high" },
    { text: "domain, realm", confidence: "medium" }
  ],
  "varios": [
    { text: "several, various", confidence: "high" }
  ],
  "idiomas": [
    { text: "languages", confidence: "high" }
  ],
  "convertido": [
    { text: "converted, turned into", confidence: "high" }
  ],
  "habilidad": [
    { text: "skill, ability", confidence: "high" }
  ],
  "esencial": [
    { text: "essential, vital", confidence: "high" }
  ],
  "beneficios": [
    { text: "benefits, advantages", confidence: "high" }
  ],
  "aprendizaje": [
    { text: "learning", confidence: "high" }
  ],
  "más": [
    { text: "more", confidence: "high" }
  ],
  "allá": [
    { text: "beyond, over there", confidence: "high" }
  ]
};

// Expanded mock section translations
const sectionTranslations = {
  // First paragraph
  "En el mundo globalizado de hoy": "In today's globalized world",
  "el dominio de varios idiomas se ha convertido en una habilidad esencial": "mastering multiple languages has become an essential skill",
  "Los beneficios del aprendizaje de idiomas van más allá de la simple comunicación": "The benefits of language learning go beyond simple communication",
  "mundo globalizado": "globalized world",
  "habilidad esencial": "essential skill",
  "beneficios del aprendizaje": "benefits of learning",
  "más allá": "beyond",
  "simple comunicación": "simple communication",
  
  // Second paragraph
  "Los estudios han demostrado que aprender un nuevo idioma mejora la memoria": "Studies have shown that learning a new language improves memory",
  "aprender un nuevo idioma": "learning a new language",
  "mejora la memoria": "improves memory",
  "aumenta la capacidad de resolución de problemas": "increases problem-solving abilities",
  "fortalece las habilidades cognitivas": "strengthens cognitive skills",
  "habilidades cognitivas en general": "cognitive skills in general",
  
  // Third paragraph
  "Además, el conocimiento de otros idiomas": "Additionally, knowledge of other languages",
  "abre puertas a nuevas culturas": "opens doors to new cultures",
  "perspectivas y oportunidades profesionales": "perspectives and professional opportunities",
  "nuevas culturas": "new cultures",
  "oportunidades profesionales": "professional opportunities",
  
  // Full sentences
  "En el mundo globalizado de hoy, el dominio de varios idiomas se ha convertido en una habilidad esencial.": 
    "In today's globalized world, mastering multiple languages has become an essential skill.",
  "Los beneficios del aprendizaje de idiomas van más allá de la simple comunicación.": 
    "The benefits of language learning go beyond simple communication.",
  "Los estudios han demostrado que aprender un nuevo idioma mejora la memoria, aumenta la capacidad de resolución de problemas y fortalece las habilidades cognitivas en general.": 
    "Studies have shown that learning a new language improves memory, increases problem-solving abilities, and strengthens cognitive skills in general.",
  "Además, el conocimiento de otros idiomas abre puertas a nuevas culturas, perspectivas y oportunidades profesionales.": 
    "Additionally, knowledge of other languages opens doors to new cultures, perspectives, and professional opportunities."
};

const EnhancedLanguageReader = () => {
  // State variables
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false);
  const [isHighlightingActive, setIsHighlightingActive] = useState(true);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [wordPopup, setWordPopup] = useState({ visible: false, word: null, position: { top: 0, left: 0 } });
  const [sectionPopup, setSectionPopup] = useState({ visible: false, text: "", translation: "", position: { top: 0, left: 0 } });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState('light');
  const [fontFamily, setFontFamily] = useState('serif');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [textWidth, setTextWidth] = useState(700);
  
  // Refs
  const appContainerRef = useRef<HTMLDivElement>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const wordPopupRef = useRef<HTMLDivElement>(null);
  const sectionPopupRef = useRef<HTMLDivElement>(null);

  // Handle scroll to update progress bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Completely overhauled click handler for dismissing popups
  useEffect(() => {
    const dismissPopups = (e: MouseEvent) => {
      // Don't do anything if we're selecting text
      if (window.getSelection()?.toString().trim()) {
        return;
      }

      // Handle word popups
      if (wordPopup.visible) {
        const wordPopupElement = wordPopupRef.current;
        if (wordPopupElement && !wordPopupElement.contains(e.target as Node) && !(e.target as HTMLElement).classList.contains('word')) {
          setWordPopup(prev => ({ ...prev, visible: false }));
          setActiveWordId(null);
        }
      }

      // Handle section translation popups
      if (sectionPopup.visible) {
        const sectionPopupElement = sectionPopupRef.current;
        if (sectionPopupElement && !sectionPopupElement.contains(e.target as Node)) {
          setSectionPopup(prev => ({ ...prev, visible: false }));
        }
      }
    };

    document.addEventListener('mousedown', dismissPopups);
    document.addEventListener('click', dismissPopups);
    
    return () => {
      document.removeEventListener('mousedown', dismissPopups);
      document.removeEventListener('click', dismissPopups);
    };
  }, [wordPopup.visible, sectionPopup.visible]);

  // Position settings panel when button is clicked
  useEffect(() => {
    if (isSettingsPanelVisible && settingsBtnRef.current && settingsPanelRef.current) {
      positionSettingsPanel();
    }
  }, [isSettingsPanelVisible]);

  // Update settings panel position when window is resized or scrolled
  useEffect(() => {
    const handleResize = () => {
      if (isSettingsPanelVisible) {
        positionSettingsPanel();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isSettingsPanelVisible]);

  // Function to position settings panel next to button
  const positionSettingsPanel = () => {
    if (!settingsBtnRef.current || !settingsPanelRef.current || !sidebarRef.current) return;

    const btnRect = settingsBtnRef.current.getBoundingClientRect();
    const sidebarRect = sidebarRef.current.getBoundingClientRect();

    // Position panel to the right of the sidebar
    const leftPos = sidebarRect.right + 10; // 10px gap

    // Position vertically centered with the button
    let topPos = btnRect.top - 10; // Slightly above the button

    // Ensure panel stays within viewport
    const viewportHeight = window.innerHeight;
    const panelHeight = settingsPanelRef.current.offsetHeight || 400;

    if (topPos + panelHeight > viewportHeight - 20) {
      topPos = viewportHeight - panelHeight - 20;
    }

    if (topPos < 20) {
      topPos = 20;
    }

    settingsPanelRef.current.style.top = `${topPos}px`;
    settingsPanelRef.current.style.left = `${leftPos}px`;
  };

  // Handle word click
  const handleWordClick = (word: any, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // If this word is already active, deactivate it
    if (word.id === activeWordId) {
      setActiveWordId(null);
      setWordPopup(prev => ({ ...prev, visible: false }));
      return;
    }

    // Close section popup if open
    if (sectionPopup.visible) {
      setSectionPopup(prev => ({ ...prev, visible: false }));
    }

    // Set this word as active
    setActiveWordId(word.id);

    // Calculate position for popup
    const wordElement = event.target as HTMLElement;
    const wordRect = wordElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const popupWidth = 280; // Width of the popup from CSS
    
    // Calculate the best left position to keep popup within viewport
    let leftPos = wordRect.left;
    
    // If the popup would extend beyond the right edge, adjust position
    if (leftPos + popupWidth > viewportWidth - 20) {
      leftPos = viewportWidth - popupWidth - 20; // 20px padding from edge
    }

    // Show word popup
    setWordPopup({
      visible: true,
      word: word,
      position: {
        top: wordRect.bottom + scrollTop + 10,
        left: leftPos
      }
    });
  };

  // Handle text selection for translation
  const handleTextSelection = (event: React.MouseEvent) => {
    // Get the current selection
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // If there's no selection or it's just a single word, don't process
    if (!selectedText || selectedText.split(/\s+/).length < 2) {
      return;
    }

    // Check if the selection is inside a popup - if so, don't show another popup
    const selectionNode = selection?.anchorNode?.parentElement;
    if (
      selectionNode && 
      (selectionNode.closest('.word-popup') || selectionNode.closest('.section-translation-popup'))
    ) {
      return;
    }

    // Close word popup if open
    if (wordPopup.visible) {
      setWordPopup(prev => ({ ...prev, visible: false }));
      setActiveWordId(null);
    }

    // Get selection coordinates
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Get translation (improved implementation)
    const translation = getMockSectionTranslation(selectedText);

    // Position popup below selection
    const popupWidth = 400; // Same as in CSS
    let leftPos = rect.left + (rect.width / 2) - (popupWidth / 2);

    // Keep popup within viewport
    const viewportWidth = window.innerWidth;
    if (leftPos < 20) leftPos = 20;
    if (leftPos + popupWidth > viewportWidth - 20) leftPos = viewportWidth - popupWidth - 20;

    // Show section translation popup
    setSectionPopup({
      visible: true,
      text: selectedText,
      translation: translation,
      position: {
        top: rect.bottom + scrollTop + 10,
        left: leftPos
      }
    });
  };

  // Mock function to get translations
  const getMockTranslations = (word: string) => {
    return translations[word.toLowerCase()] || [
      { text: `translation not available`, confidence: "high" }
    ];
  };

  // Improved mock function to get section translations
  const getMockSectionTranslation = (text: string) => {
    const normalizedText = text.trim().toLowerCase();

    // First try exact match (case insensitive)
    for (const [spanish, english] of Object.entries(sectionTranslations)) {
      if (normalizedText === spanish.toLowerCase()) {
        return english;
      }
    }

    // Then try to find the longest matching substring
    let bestMatch = "";
    let bestTranslation = "";

    for (const [spanish, english] of Object.entries(sectionTranslations)) {
      if (normalizedText.includes(spanish.toLowerCase()) && spanish.length > bestMatch.length) {
        bestMatch = spanish;
        bestTranslation = english;
      }
    }

    if (bestTranslation) {
      return bestTranslation;
    }

    // If no match found, use fallback sentence length-based approximation
    const words = normalizedText.split(/\s+/).length;
    
    if (words < 5) {
      return "Short phrase translation";
    } else if (words < 10) {
      return "Medium-length sentence translation. The importance of language learning.";
    } else {
      return "Longer paragraph translation. In today's globalized world, mastering multiple languages has become an essential skill. The benefits of language learning go beyond simple communication.";
    }
  };

  // Add to flashcards
  const handleAddToFlashcards = (word: any) => {
    setActiveWordId(null);
    setWordPopup(prev => ({ ...prev, visible: false }));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
    
    if (isSettingsPanelVisible) {
      setTimeout(positionSettingsPanel, 300); // Wait for sidebar transition to complete
    }
  };

  // Toggle word highlighting
  const toggleHighlighting = () => {
    setIsHighlightingActive(!isHighlightingActive);
  };

  // Toggle settings panel
  const toggleSettingsPanel = () => {
    setIsSettingsPanelVisible(!isSettingsPanelVisible);
  };

  // Close settings panel
  const closeSettingsPanel = () => {
    setIsSettingsPanelVisible(false);
  };

  // Theme functions
  const setThemeOption = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Font family functions
  const setFontFamilyOption = (newFamily: string) => {
    setFontFamily(newFamily);
  };

  // Font size controls
  const decreaseFontSize = () => {
    if (fontSize > 14) {
      setFontSize(fontSize - 1);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 1);
    }
  };

  // Line height controls
  const decreaseLineHeight = () => {
    if (lineHeight > 1.3) {
      setLineHeight(Math.round((lineHeight - 0.1) * 10) / 10);
    }
  };

  const increaseLineHeight = () => {
    if (lineHeight < 2.2) {
      setLineHeight(Math.round((lineHeight + 0.1) * 10) / 10);
    }
  };

  // Text width controls
  const decreaseWidth = () => {
    if (textWidth > 500) {
      setTextWidth(textWidth - 50);
    }
  };

  const increaseWidth = () => {
    if (textWidth < 900) {
      setTextWidth(textWidth + 50);
    }
  };

  // CSS styles
  const styles = {
    root: {
      ...(theme === 'dark'
        ? {
            backgroundColor: '#222',
            color: '#eee',
          }
        : theme === 'sepia'
        ? {
            backgroundColor: '#f5f0e8',
          }
        : {}),
      ...(fontFamily === 'sans'
        ? {
            fontFamily: '"Arial", "Helvetica", sans-serif',
          }
        : {
            fontFamily: '"Georgia", "Times New Roman", serif',
          }),
      fontSize: `${fontSize}px`,
      margin: 0,
      padding: 0,
      lineHeight: 1.5,
      wordSpacing: 'normal',
      transition: 'background-color 0.3s, color 0.3s',
    },
    progressBar: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      height: '3px',
      backgroundColor: theme === 'dark' ? '#e0a87d' : '#8B4513',
      width: `${scrollProgress}%`,
      zIndex: 5,
      transition: 'width 0.1s',
    },
    appContainer: {
      display: 'flex',
      minHeight: '100vh',
      position: 'relative' as const,
    },
    sidebar: {
      width: isSidebarExpanded ? '240px' : '60px',
      backgroundColor:
        theme === 'dark'
          ? '#2a2a2a'
          : theme === 'sepia'
          ? '#f8f5f0'
          : '#fff',
      borderRight:
        theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      transition: 'width 0.3s, background-color 0.3s',
      boxShadow: '1px 0 5px rgba(0,0,0,0.05)',
      position: 'sticky' as const,
      top: 0,
      height: '100vh',
      overflowY: 'auto' as const,
      zIndex: 10,
    },
    sidebarHeader: {
      width: '100%',
      padding: '15px 0',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderBottom:
        theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      backgroundColor: theme === 'dark' ? '#383838' : '',
    },
    sidebarToggle: {
      background: 'none',
      border: 'none',
      color: '#8B4513',
      cursor: 'pointer',
      padding: '10px',
      marginLeft: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s',
    },
    sidebarToggleSvg: {
      width: '20px',
      height: '20px',
      fill: theme === 'dark' ? '#ffffff' : 'currentColor',
      transition: 'transform 0.3s',
      transform: isSidebarExpanded ? 'rotate(180deg)' : 'none',
    },
    sidebarTitle: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#f0f0f0' : '#5d2e0d',
      marginLeft: '15px',
      whiteSpace: 'nowrap' as const,
      opacity: isSidebarExpanded ? 1 : 0,
      transition: 'opacity 0.2s',
      display: isSidebarExpanded ? 'block' : 'none',
      fontFamily: '"Arial", "Helvetica", sans-serif',
      textAlign: 'left' as const,
    },
    sidebarContent: {
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '15px 0',
      overflowY: 'auto' as const,
    },
    sidebarSection: {
      width: '100%',
      marginBottom: '20px',
    },
    sidebarBtn: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '12px 15px',
      background: 'none',
      border: 'none',
      color: theme === 'dark' ? '#f0f0f0' : '#5d2e0d',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      position: 'relative' as const,
    },
    sidebarBtnHighlight: {
      backgroundColor: isHighlightingActive
        ? theme === 'dark'
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(139, 69, 19, 0.1)'
        : 'transparent',
    },
    sidebarBtnSettings: {
      backgroundColor: isSettingsPanelVisible
        ? theme === 'dark'
          ? 'rgba(255, 255, 255, 0.15)'
          : 'rgba(139, 69, 19, 0.1)'
        : 'transparent',
    },
    sidebarBtnIcon: {
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sidebarBtnIconSvg: {
      width: '20px',
      height: '20px',
      fill: 'currentColor',
    },
    sidebarBtnLabel: {
      marginLeft: '15px',
      whiteSpace: 'nowrap' as const,
      opacity: isSidebarExpanded ? 1 : 0,
      transition: 'opacity 0.2s',
      display: isSidebarExpanded ? 'block' : 'none',
    },
    readerContainer: {
      flex: 1,
      padding: '40px 60px',
      maxWidth: `${textWidth}px`,
      margin: '0 auto',
      backgroundColor:
        theme === 'dark'
          ? '#333'
          : theme === 'sepia'
          ? '#fbf5e9'
          : '#fff',
      boxShadow:
        theme === 'dark'
          ? '0 2px 15px rgba(0, 0, 0, 0.3)'
          : '0 2px 10px rgba(0, 0, 0, 0.08)',
      minHeight: '100vh',
      transition: 'max-width 0.3s, background-color 0.3s, margin-left 0.3s',
    },
    heading: {
      fontFamily:
        fontFamily === 'sans'
          ? '"Arial", "Helvetica", sans-serif'
          : '"Baskerville", "Georgia", serif',
      color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a',
      lineHeight: 1.3,
      marginTop: '0.5em',
      marginBottom: '0.7em',
      fontSize: '2.2em',
      fontWeight: 'bold',
      transition: 'color 0.3s',
    },
    articleContent: {
      textAlign: 'justify' as const,
      marginBottom: '40px',
      lineHeight: lineHeight,
      transition: 'line-height 0.3s',
      position: 'relative' as const,
      userSelect: 'text',
    },
    word: {
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '1px dotted transparent',
      display: 'inline',
      userSelect: 'text' as const,
    },
    wordSpace: {
      display: 'inline',
      width: 'auto',
    },
    settingsPanel: {
      position: 'fixed' as const,
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      borderRadius: '8px',
      boxShadow: '0 3px 15px rgba(0, 0, 0, 0.2)',
      zIndex: 95,
      width: '300px',
      padding: 0,
      fontFamily: '"Georgia", "Times New Roman", serif',
      transform: isSettingsPanelVisible ? 'translateY(0)' : 'translateY(20px)',
      opacity: isSettingsPanelVisible ? 1 : 0,
      pointerEvents: isSettingsPanelVisible ? 'auto' : 'none',
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      border: theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      overflow: 'hidden' as const,
    },
    settingsHeader: {
      padding: '15px',
      backgroundColor: theme === 'dark' ? '#383838' : '#f8f5f0',
      borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingsTitle: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#f0f0f0' : '#5d2e0d',
    },
    closeSettings: {
      background: 'none',
      border: 'none',
      color: theme === 'dark' ? '#aaa' : '#666',
      cursor: 'pointer',
      padding: '5px',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    settingsContent: {
      padding: '15px',
      maxHeight: '400px',
      overflowY: 'auto' as const,
    },
    settingsSection: {
      marginBottom: '20px',
    },
    settingsLastSection: {
      marginBottom: 0,
    },
    settingsSectionTitle: {
      fontWeight: 'bold',
      marginBottom: '12px',
      fontSize: '0.95em',
      color: theme === 'dark' ? '#e0a87d' : '#5d2e0d',
      transition: 'color 0.3s',
    },
    settingsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
    },
    settingsLastRow: {
      marginBottom: 0,
    },
    settingsLabel: {
      fontSize: '0.9em',
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    settingsControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    controlBtn: {
      width: '32px',
      height: '32px',
      border: theme === 'dark' ? '1px solid #555' : '1px solid #e2d1c3',
      backgroundColor: theme === 'dark' ? '#444' : 'white',
      color: theme === 'dark' ? '#f0f0f0' : '#5d2e0d',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    controlBtnDisabled: {
      opacity: 0.5,
      cursor: 'default',
    },
    controlValue: {
      fontSize: '0.85em',
      minWidth: '30px',
      textAlign: 'center' as const,
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    themeOptions: {
      display: 'flex',
      gap: '8px',
    },
    themeOption: (optionTheme: string) => ({
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      cursor: 'pointer',
      border:
        theme === optionTheme
          ? `2px solid ${theme === 'dark' ? '#e0a87d' : '#8B4513'}`
          : '2px solid transparent',
      backgroundColor:
        optionTheme === 'light'
          ? '#fff'
          : optionTheme === 'sepia'
          ? '#f8f5f0'
          : '#333',
      boxShadow:
        optionTheme === 'dark'
          ? '0 0 0 1px rgba(0, 0, 0, 0.3)'
          : '0 0 0 1px rgba(0, 0, 0, 0.1)',
      transition: 'border-color 0.2s',
    }),
    fontOptions: {
      display: 'flex',
      gap: '8px',
    },
    fontOption: (optionFamily: string) => ({
      padding: '6px 10px',
      border:
        fontFamily === optionFamily
          ? `1px solid ${theme === 'dark' ? '#e0a87d' : '#8B4513'}`
          : theme === 'dark'
          ? '1px solid #555'
          : '1px solid #e2d1c3',
      borderRadius: '4px',
      fontSize: '0.85em',
      cursor: 'pointer',
      backgroundColor:
        fontFamily === optionFamily
          ? theme === 'dark'
            ? '#e0a87d'
            : '#8B4513'
          : theme === 'dark'
          ? '#444'
          : 'white',
      color:
        fontFamily === optionFamily
          ? 'white'
          : theme === 'dark'
          ? '#f0f0f0'
          : 'inherit',
      fontFamily:
        optionFamily === 'serif'
          ? '"Georgia", "Times New Roman", serif'
          : '"Arial", "Helvetica", sans-serif',
      transition: 'background-color 0.2s',
    }),
    wordPopup: {
      position: 'fixed' as const,
      width: '280px',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      borderRadius: '6px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      zIndex: 100,
      opacity: wordPopup.visible ? 1 : 0,
      transform: wordPopup.visible ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      overflow: 'hidden',
      fontFamily: '"Georgia", "Times New Roman", serif',
      border: theme === 'dark' ? '1px solid #444' : '1px solid rgba(0, 0, 0, 0.08)',
      top: wordPopup.position.top,
      left: wordPopup.position.left,
      pointerEvents: wordPopup.visible ? 'auto' : 'none',
    },
    popupHeader: {
      padding: '12px 15px',
      backgroundColor: theme === 'dark' ? '#383838' : '#f8f5f0',
      borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      fontWeight: 'bold',
      fontSize: '1.1em',
      color: theme === 'dark' ? '#e0a87d' : '#5d2e0d',
    },
    translationsContainer: {
      padding: '15px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
    },
    translation: (confidence: string, isLast: boolean) => ({
      padding: '8px 0',
      borderBottom: isLast
        ? 'none'
        : theme === 'dark'
        ? '1px solid #444'
        : '1px solid #f0e9e0',
      lineHeight: 1.4,
      fontSize: '0.95em',
      color:
        confidence === 'high'
          ? theme === 'dark'
            ? '#f0f0f0'
            : '#333'
          : theme === 'dark'
          ? '#ccc'
          : '#666',
      fontStyle: confidence === 'medium' ? 'italic' : 'normal',
    }),
    flashcardBtn: (isUnknown: boolean) => ({
      display: 'block',
      width: '100%',
      padding: '12px 15px',
      backgroundColor:
        theme === 'dark'
          ? isUnknown
            ? '#e0a87d'
            : '#a38269'
          : isUnknown
          ? '#8B4513'
          : '#9a764e',
      color: 'white',
      border: 'none',
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontSize: '0.9em',
      cursor: isUnknown ? 'pointer' : 'default',
      transition: 'background-color 0.2s',
      outline: 'none',
    }),
    sectionPopup: {
      position: 'fixed' as const,
      width: '400px',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
      borderRadius: '6px',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.2)',
      zIndex: 100,
      opacity: sectionPopup.visible ? 1 : 0,
      transform: sectionPopup.visible ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      overflow: 'hidden',
      fontFamily: '"Georgia", "Times New Roman", serif',
      border: theme === 'dark' ? '1px solid #444' : '1px solid rgba(0, 0, 0, 0.08)',
      top: sectionPopup.position.top,
      left: sectionPopup.position.left,
      pointerEvents: sectionPopup.visible ? 'auto' : 'none',
    },
    sectionOriginal: {
      padding: '15px',
      backgroundColor: theme === 'dark' ? '#383838' : '#f8f5f0',
      borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
      fontStyle: 'italic',
      color: theme === 'dark' ? '#e0a87d' : '#5d2e0d',
      lineHeight: 1.4,
    },
    sectionTranslation: {
      padding: '15px',
      lineHeight: 1.5,
      color: theme === 'dark' ? '#f0f0f0' : '#333',
    },
    sectionFooter: {
      padding: '10px 15px',
      backgroundColor: theme === 'dark' ? '#383838' : '#f6f6f6',
      color: theme === 'dark' ? '#aaa' : '#666',
      fontSize: '0.85em',
      textAlign: 'left' as const,
      borderTop: theme === 'dark' ? '1px solid #444' : '1px solid #e2d1c3',
    },
    unknownWord: {
      backgroundColor:
        theme === 'dark'
          ? 'rgba(224, 168, 125, 0.15)'
          : 'rgba(255, 236, 179, 0.3)',
      borderBottom:
        theme === 'dark'
          ? '1px dashed #e0a87d'
          : '1px dashed #d9a760',
      padding: '0px 1px',
      position: 'relative' as const,
    },
    activeWord: {
      color: theme === 'dark' ? '#e0a87d' : '#8B4513',
      backgroundColor:
        theme === 'dark'
          ? 'rgba(224, 168, 125, 0.2)'
          : 'rgba(139, 69, 19, 0.08)',
      borderRadius: '2px',
    },
    closeButton: {
      position: 'absolute' as const,
      top: -15,
      right: -15,
      width: 30,
      height: 30,
      borderRadius: '50%',
      backgroundColor: theme === 'dark' ? '#383838' : '#f8f5f0',
      border: theme === 'dark' ? '1px solid #555' : '1px solid #e2d1c3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 101,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      fontSize: '16px',
      fontWeight: 'bold' as const,
      color: theme === 'dark' ? '#aaa' : '#666',
    }
  };

  // Rendering word popup without the X (close) button
  const renderWordPopup = () => {
    if (!wordPopup.visible || !wordPopup.word) return null;

    const word = wordPopup.word;
    const translations = getMockTranslations(word.text);

    return (
      <div ref={wordPopupRef} className="word-popup" style={styles.wordPopup}>
        <div className="popup-header" style={styles.popupHeader}>
          {word.text}
        </div>
        <div className="translations-container" style={styles.translationsContainer}>
          {translations.map((translation, idx) => {
            const parts = translation.text.split(', ');
            return parts.map((part, partIdx) => (
              <div 
                key={`${idx}-${partIdx}`} 
                className={`translation ${translation.confidence}`}
                style={styles.translation(translation.confidence, partIdx === parts.length - 1)}
              >
                {part}
              </div>
            ));
          })}
        </div>
        <button 
          className={`flashcard-btn ${word.unknown ? '' : 'disabled'}`}
          style={styles.flashcardBtn(word.unknown)}
          disabled={!word.unknown}
          onClick={() => handleAddToFlashcards(word)}
        >
          {word.unknown ? 'Add to Flashcards' : 'Already in Study List'}
        </button>
      </div>
    );
  };

  // Rendering section translation popup without the X (close) button
  const renderSectionPopup = () => {
    if (!sectionPopup.visible) return null;

    return (
      <div ref={sectionPopupRef} className="section-translation-popup" style={styles.sectionPopup}>
        <div className="section-original" style={styles.sectionOriginal}>
          {sectionPopup.text}
        </div>
        <div className="section-translation" style={styles.sectionTranslation}>
          {sectionPopup.translation}
        </div>
        <div className="section-translation-footer" style={styles.sectionFooter}>
          Powered by Neural Translation
        </div>
      </div>
    );
  };

  // Helper for showing word with proper spacing
  const renderWord = (word: any, wIdx: number, paragraph: any[]) => {
    const isPunctuation = /^[,.;:!?]$/.test(word.text);
    const needsSpace = !isPunctuation && wIdx > 0 && !/^[,.;:!?]$/.test(paragraph[wIdx - 1].text);

    return (
      <React.Fragment key={`w-${word.id}`}>
        {needsSpace && <span style={styles.wordSpace}> </span>}
        <span 
          className="word"
          style={{
            ...styles.word,
            ...(word.unknown && isHighlightingActive ? styles.unknownWord : {}),
            ...(word.id === activeWordId ? styles.activeWord : {}),
          }}
          onClick={(e) => handleWordClick(word, e)}
        >
          {word.text}
        </span>
      </React.Fragment>
    );
  };

  return (
    <div style={styles.root}>
      {/* Reading progress indicator */}
      <div id="scroll-progress-bar" style={styles.progressBar} />
      
      <div style={styles.appContainer}>
        {/* Sidebar */}
        <div ref={sidebarRef} style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <button 
              style={styles.sidebarToggle}
              onClick={toggleSidebar}
              title="Toggle Sidebar"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24"
                style={styles.sidebarToggleSvg}
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
            <span style={styles.sidebarTitle}>Reader Tools</span>
          </div>
          
          <div style={styles.sidebarContent}>
            <div style={styles.sidebarSection}>
              {/* Toggle Highlighting button */}
              <button 
                style={{...styles.sidebarBtn, ...styles.sidebarBtnHighlight}}
                onClick={toggleHighlighting}
              >
                <div style={styles.sidebarBtnIcon}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                    style={styles.sidebarBtnIconSvg}
                  >
                    <path d="M3.55 19.09l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM11 23h2v-2.95h-2V23zM4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-1.95-.7-3.73-1.86-5.13L16.8 7.21C17.57 8.28 18 9.58 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-1.42.5-2.73 1.32-3.77L5.99 5.86C4.83 7.27 4 9.05 4 11zm19-3h-3v-2h-2v2h-3v2h3v2h2v-2h3v-2zM15 2h-2v3h2V2zm-6.46 4.01L7.13 4.59 5.64 6.09l1.41 1.41 1.49-1.49z"/>
                  </svg>
                </div>
                <span style={styles.sidebarBtnLabel}>
                  Toggle Highlighting
                </span>
              </button>
              
              {/* Reader Settings button */}
              <button 
                ref={settingsBtnRef}
                style={{...styles.sidebarBtn, ...styles.sidebarBtnSettings}}
                onClick={toggleSettingsPanel}
              >
                <div style={styles.sidebarBtnIcon}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                    style={styles.sidebarBtnIconSvg}
                  >
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                </div>
                <span style={styles.sidebarBtnLabel}>
                  Reader Settings
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Reader Settings Panel */}
        <div ref={settingsPanelRef} style={styles.settingsPanel}>
          <div style={styles.settingsHeader}>
            <div style={styles.settingsTitle}>
              Reader Settings
            </div>
            <button 
              style={styles.closeSettings}
              onClick={closeSettingsPanel}
            >
              ×
            </button>
          </div>
          <div style={styles.settingsContent}>
            <div style={styles.settingsSection}>
              <div style={styles.settingsSectionTitle}>
                Text
              </div>
              
              <div style={styles.settingsRow}>
                <div style={styles.settingsLabel}>
                  Font Size
                </div>
                <div style={styles.settingsControls}>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(fontSize <= 14 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={fontSize <= 14}
                    onClick={decreaseFontSize}
                  >
                    −
                  </button>
                  <span style={styles.controlValue}>
                    {fontSize}px
                  </span>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(fontSize >= 24 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={fontSize >= 24}
                    onClick={increaseFontSize}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={styles.settingsRow}>
                <div style={styles.settingsLabel}>
                  Line Spacing
                </div>
                <div style={styles.settingsControls}>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(lineHeight <= 1.3 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={lineHeight <= 1.3}
                    onClick={decreaseLineHeight}
                  >
                    −
                  </button>
                  <span style={styles.controlValue}>
                    {lineHeight.toFixed(1)}
                  </span>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(lineHeight >= 2.2 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={lineHeight >= 2.2}
                    onClick={increaseLineHeight}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div style={styles.settingsRow}>
                <div style={styles.settingsLabel}>
                  Text Width
                </div>
                <div style={styles.settingsControls}>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(textWidth <= 500 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={textWidth <= 500}
                    onClick={decreaseWidth}
                  >
                    −
                  </button>
                  <span style={styles.controlValue}>
                    {textWidth}px
                  </span>
                  <button 
                    style={{
                      ...styles.controlBtn,
                      ...(textWidth >= 900 ? styles.controlBtnDisabled : {}),
                    }}
                    disabled={textWidth >= 900}
                    onClick={increaseWidth}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{...styles.settingsSection, ...styles.settingsLastSection}}>
              <div style={styles.settingsSectionTitle}>
                Appearance
              </div>
              
              <div style={styles.settingsRow}>
                <div style={styles.settingsLabel}>
                  Theme
                </div>
                <div style={styles.themeOptions}>
                  <div 
                    style={styles.themeOption('light')}
                    onClick={() => setThemeOption('light')}
                    title="Light"
                  />
                  <div 
                    style={styles.themeOption('sepia')}
                    onClick={() => setThemeOption('sepia')}
                    title="Sepia"
                  />
                  <div 
                    style={styles.themeOption('dark')}
                    onClick={() => setThemeOption('dark')}
                    title="Dark"
                  />
                </div>
              </div>
              
              <div style={{...styles.settingsRow, ...styles.settingsLastRow}}>
                <div style={styles.settingsLabel}>
                  Font Family
                </div>
                <div style={styles.fontOptions}>
                  <div 
                    style={styles.fontOption('serif')}
                    onClick={() => setFontFamilyOption('serif')}
                  >
                    Serif
                  </div>
                  <div 
                    style={styles.fontOption('sans')}
                    onClick={() => setFontFamilyOption('sans')}
                  >
                    Sans
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        {/* Main Reader Content */}
        <div 
          ref={readerContainerRef}
          style={styles.readerContainer}
          onMouseUp={handleTextSelection}
        >
          <h1 style={styles.heading}>
            {articleData.title}
          </h1>
          
          {articleData.paragraphs.map((paragraph, pIdx) => (
            <div key={`p-${pIdx}`} style={styles.articleContent}>
              {paragraph.map((word, wIdx) => renderWord(word, wIdx, paragraph))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Render popups */}
      {renderWordPopup()}
      {renderSectionPopup()}
    </div>
  );
};

export default EnhancedLanguageReader;
