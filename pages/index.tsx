import Head from 'next/head';
import { GetStaticProps } from 'next';

// Define the type for a news article
interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  generatedContent: string; // New property for AI-generated content
  sentiment: 'bullish' | 'bearish' | 'neutral'; // New property for sentiment
}

// Define the props for the Home component
interface HomeProps {
  articles: Article[];
  summary: string;
}

// Function to simulate AI content generation
async function generateBlogPostContent(title: string, description: string): Promise<string> {
  // In a real scenario, this would call an AI model API (e.g., Gemini API)
  // For this demonstration, we'll use a simple prompt to generate content.
  const prompt = `Write a short blog post (around 100-150 words) based on the following news article. Focus on explaining the key points and their potential implications.

Title: ${title}
Summary: ${description}

Blog Post:`;

  // Simulate calling a text generation model
  // In a real Gemini CLI integration, this would be a direct call to the Gemini API
  // For now, we'll return a placeholder or a very basic generated text.
  // This part would be replaced by an actual call to a text generation model.
  // For the purpose of this demonstration, I will return a placeholder.
  return `This is an AI-generated blog post about "${title}". The article discusses: ${description}. Further analysis suggests... [Continue with AI-generated insights and implications based on the summary].`;
}

// Function to analyze sentiment based on keywords
function analyzeSentiment(title: string, description: string): 'bullish' | 'bearish' | 'neutral' {
  const text = (title + ' ' + description).toLowerCase();

  const bullishKeywords = ['gain', 'rise', 'grow', 'up', 'strong', 'positive', 'boost', 'rally', 'surge', 'profit', 'success', 'optimistic', 'breakthrough', 'expansion', 'increase', 'outperform'];
  const bearishKeywords = ['lose', 'fall', 'drop', 'down', 'weak', 'negative', 'slump', 'decline', 'plunge', 'loss', 'fail', 'pessimistic', 'crisis', 'contraction', 'decrease', 'underperform'];

  let bullishScore = 0;
  let bearishScore = 0;

  bullishKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      bullishScore++;
    }
  });

  bearishKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      bearishScore++;
    }
  });

  if (bullishScore > bearishScore) {
    return 'bullish';
  } else if (bearishScore > bullishScore) {
    return 'bearish';
  } else {
    return 'neutral';
  }
}

export default function Home({ articles, summary }: HomeProps) {
  return (
    <div className="container">
      <Head>
        <title>Financial News</title>
        <meta name="description" content="The latest financial news" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-5">
        <h1 className="text-center mb-4">Financial News</h1>

        <div className="card mb-4">
          <div className="card-body">
            <h2 className="card-title">Today's Top Stories</h2>
            <p className="card-text" dangerouslySetInnerHTML={{ __html: summary }}></p>
          </div>
        </div>

        <div className="row">
          {articles.map((article, index) => (
            <div className="col-md-4 mb-4" key={index} id={`article-${index}`}>
              <div className="card">
                <img src={article.urlToImage || 'https://via.placeholder.com/150'} className="card-img-top" alt={article.title} />
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.generatedContent}</p>
                  <a href={article.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </div>
                <div className="card-footer">
                  <small className="text-muted">
                    {new Date(article.publishedAt).toLocaleDateString()} - {article.source.name}
                  </small>
                  <span className={`badge ms-2 bg-${article.sentiment === 'bullish' ? 'success' : article.sentiment === 'bearish' ? 'danger' : 'secondary'}`}>
                    {article.sentiment}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  // IMPORTANT: Replace with your own Alpha Vantage API key
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'YOUR_API_KEY';
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // The Alpha Vantage API returns the articles in the 'feed' property.
    const articles = data.feed || [];

    // The articles from Alpha Vantage have a different structure.
    // We need to map them to the Article interface.
    const formattedArticlesPromises = articles.map(async (article: any) => {
      const generatedContent = await generateBlogPostContent(article.title, article.summary);
      const sentiment = analyzeSentiment(article.title, article.summary); // Analyze sentiment
      return {
        title: article.title,
        description: article.summary,
        url: article.url,
        urlToImage: article.banner_image,
        publishedAt: article.time_published ?
          `${article.time_published.substring(0, 4)}-${article.time_published.substring(4, 6)}-${article.time_published.substring(6, 8)}T${article.time_published.substring(9, 11)}:${article.time_published.substring(11, 13)}:${article.time_published.substring(13, 15)}` :
          new Date().toISOString(),
        source: {
          name: article.source || 'Unknown Source',
        },
        generatedContent: generatedContent,
        sentiment: sentiment,
      };
    });

    const formattedArticles = await Promise.all(formattedArticlesPromises);

    // Generate summary for the top 10 articles
    const topArticles = formattedArticles.slice(0, 10);
    const summary = topArticles.map((article, index) => (
      `<a href="#article-${index}" style="scroll-behavior: smooth;">${article.title}</a> <span class="badge bg-${article.sentiment === 'bullish' ? 'success' : article.sentiment === 'bearish' ? 'danger' : 'secondary'}">${article.sentiment}</span>`
    )).join('<br/>');

    return {
      props: {
        articles: formattedArticles,
        summary: summary,
      },
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      props: {
        articles: [],
        summary: 'Could not fetch top stories.',
      },
    };
  }
};