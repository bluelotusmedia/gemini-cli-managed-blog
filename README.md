# Financial News Blog

This is a blog that displays the latest financial news, updated daily. The blog is built with Next.js and deployed to GitHub Pages. The news is fetched from the [Alpha Vantage API](https://www.alphavantage.co/).

## How to set up

### 1. Get an Alpha Vantage API key

1.  Go to the [Alpha Vantage website](https://www.alphavantage.co/support/#api-key) and get a free API key.

### 2. Add the API key to your GitHub repository

1.  In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
2.  Click **New repository secret**.
3.  For the name, enter `ALPHA_VANTAGE_API_KEY`.
4.  For the value, paste your Alpha Vantage API key.

### 3. Enable GitHub Pages

1.  In your GitHub repository, go to **Settings > Pages**.
2.  For the source, select **GitHub Actions**.

### 4. Run the application locally

1.  Install the dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env.local` file in the root of the project and add your Alpha Vantage API key:
    ```
    ALPHA_VANTAGE_API_KEY=YOUR_API_KEY
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

The blog is updated daily by a GitHub Action. The workflow is defined in `.github/workflows/update-news.yml`.

The workflow runs every day at midnight UTC. It fetches the latest financial news from the Alpha Vantage API, builds the Next.js application, and deploys it to GitHub Pages.