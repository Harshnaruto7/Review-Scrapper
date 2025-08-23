# 📊 Review Scraper

A simple **Node.js tool** to scrape product reviews from multiple platforms and export them as **JSON** for analysis.  

---

## 🚀 Features
- Scrape reviews from:
  - G2
  - Capterra
  - TrustRadius
- Filter by:
  - Company name  
  - Date range  
  - Source (single or all)
- Export results to `JSON`

---

## 🛠️ Tech Stack
- Node.js  
- Puppeteer  
- Axios / Cheerio  
- File System (FS)

---

## ⚙️ Installation
* git clone (https://github.com/Harshnaruto7/Review-Scrapper.git)
```bash
npm install
```

---
## 📂 Project Structure

```text
📦 SCRAPPER
├── 📂 data
│   └── 📂 filter                
│                 
├── 📂 debug                   
├── 📂 node_modules
├── 📂 src
│   └── 📂 scrapers
│       ├── capterra.js          
│       ├── g2.js                
│       └── trustradius.js      
├── 📂 utils
│   └── filter.js                
├── .env                         
├── .env.example               
├── .eslintrc.json             
├── .gitignore                  
├── .prettierrc               
├── index.js                     
├── package-lock.json
├── package.json
└── Readme.md
```
---

## Run the scraper:

```bash
node index.js
```
