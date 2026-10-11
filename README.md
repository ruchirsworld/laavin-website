# Laavin Infrascapes Website

Official website for **Laavin Infrascapes**, specializing in landscaping, hardscaping, horticulture, and sports turf management.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)

### Installation & Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/ruchirsworld/laavin-website.git
   cd laavin-website
   ```

2. Start the local development server:
   ```bash
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## Editing pages

Every page shares one header, footer and stylesheet. Page content lives in `tools/build.js` (articles in `tools/content/articles.json`).
After editing, rebuild and check:

```bash
node tools/build.js
node tools/audit.js
```

The audit checks links, images, anchors, headings, structured data, the sitemap, and that no em or en dashes appear anywhere.
Do not hand-edit the generated HTML files; the next build overwrites them.

## 📁 Project Structure
- `public_html/` - Website static files (HTML, CSS, JS, Images, Fonts)
  - `index.html` - Homepage
  - `about.html` - About Us
  - `services.html` - Overview of Services
  - `landscaping-services.html` - Landscaping Services
  - `hardscaping-service.html` - Hardscaping Services
  - `horticulture-service.html` - Horticulture Services
  - `blog.html` - Blog Listing
  - `contact.html` - Contact Page
  - `privacy.html` - Privacy policy
  - `assets/css/site.css` - Shared design system
  - `assets/js/site.js`, `assets/js/contact-form.js` - Navigation and enquiry form
  - `contact.php` - Enquiry form mail handler (runs on the cPanel host)
  - `assets/` - Images and legacy template assets
- `tools/` - Page generator and audit script
- `server.js` - Local Node.js HTTP server
- `package.json` - Node project configuration
