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
}

// Define the props for the Home component
interface HomeProps {
  articles: Article[];
}

export default function Home({ articles }: HomeProps) {
  return (
    <div className="container">
      <Head>
        <title>Financial News</title>
        <meta name="description" content="The latest financial news" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-5">
        <h1 className="text-center mb-4">Financial News</h1>

        <div className="row">
          {articles.map((article, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card">
                <img src={article.urlToImage || 'https://via.placeholder.com/150'} className="card-img-top" alt={article.title} />
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text">{article.description}</p>
                  <a href={article.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </div>
                <div className="card-footer">
                  <small className="text-muted">
                    {new Date(article.publishedAt).toLocaleDateString()} - {article.source.name}
                  </small>
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
    const formattedArticles = articles.map((article: any) => ({
      title: article.title,
      description: article.summary,
      url: article.url,
      urlToImage: article.banner_image,
      publishedAt: article.time_published,
      source: {
        name: article.source.name,
      },
    }));

    return {
      props: {
        articles: formattedArticles,
      },
      // Re-generate the page every 24 hours
      revalidate: 60 * 60 * 24,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      props: {
        articles: [],
      },
    };
  }
};