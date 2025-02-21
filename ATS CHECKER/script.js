document.getElementById('analyzeBtn').addEventListener('click', function () {
    const file = document.getElementById('resumeUpload').files[0];
    if (!file) {
      alert('Please upload a resume file.');
      return;
    }
  
    // Show progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = '0%';
  
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        analyzeResume(file);
      }
    }, 300);
  });
  
  async function analyzeResume(file) {
    let text = '';
  
    // Extract text from PDF
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const pdfData = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ');
        }
        processText(text);
      };
      reader.readAsArrayBuffer(file);
    }
  
    // Extract text from DOCX
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        processText(text);
      };
      reader.readAsArrayBuffer(file);
    }
  
    // Unsupported file type
    else {
      alert('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  }
  
  function processText(text) {
    const { score, mistakes, suggestions } = analyzeText(text);
  
    // Display score
    document.getElementById('score').textContent = score;
  
    // Display mistakes
    const mistakesList = document.getElementById('mistakesList');
    mistakesList.innerHTML = '';
    mistakes.forEach(mistake => {
      const li = document.createElement('li');
      li.textContent = mistake;
      mistakesList.appendChild(li);
    });
  
    // Display suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      li.textContent = suggestion;
      suggestionsList.appendChild(li);
    });
  }
  
  function analyzeText(text) {
    let score = 100;
    const mistakes = [];
    const suggestions = [];
  
    // Check for keywords
    const keywords = ['experience', 'education', 'skills', 'projects'];
    keywords.forEach(keyword => {
      if (!text.toLowerCase().includes(keyword)) {
        mistakes.push(`Missing "${keyword}" section.`);
        score -= 10;
      }
    });
  
    // Check resume length
    if (text.length < 200) {
      mistakes.push('Resume is too short.');
      score -= 10;
    }
    if (text.length > 1000) {
      mistakes.push('Resume is too long.');
      score -= 10;
    }
  
    // Grammar check (basic example)
    if (text.split(' ').length < 50) {
      mistakes.push('Resume lacks detail.');
      score -= 10;
    }
  
    // Suggestions
    if (score < 80) {
      suggestions.push('Add more details to your resume.');
    }
    if (!text.toLowerCase().includes('achievements')) {
      suggestions.push('Consider adding an "Achievements" section.');
    }
  
    // Ensure score doesn't go below 0
    score = Math.max(score, 0);
  
    return { score, mistakes, suggestions };
  }