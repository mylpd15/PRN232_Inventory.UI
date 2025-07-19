export function FAQs() {
  const highlightStyle = {
    background: 'linear-gradient(90deg, #6c63ff, #5bc0eb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
    fontSize: '4rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    letterSpacing: '2px',
    fontFamily: 'Arial, sans-serif',
  };
  return (
    <div className="max-w-screen-xl mx-auto px-5 bg-white min-h-sceen m-20">
      <div className="flex flex-col items-center">
        <h1 className="mb-5 text-3xl font-semibold text-white md:text-center md:text-5xl">
          <span style={highlightStyle}>FAQs</span>
        </h1>
        <p className="text-neutral-500 text-xl mt-3">
          Frequenty asked questions
        </p>
      </div>
      <div className="grid divide-y divide-neutral-200 max-w-xl mx-auto mt-8">
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> What is a SAAS platform?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              SAAS platform is a cloud-based software service that allows users to access
              and use a variety of tools and functionality.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> How does  billing work?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              We offers a variety of billing options, including monthly and annual subscription plans,
              as well as pay-as-you-go pricing for certain services. Payment is typically made through a credit
              card or other secure online payment method.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> Can I get a refund for my subscription?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              We offers a 30-day money-back guarantee for most of its subscription plans. If you are not
              satisfied with your subscription within the first 30 days, you can request a full refund. Refunds
              for subscriptions that have been active for longer than 30 days may be considered on a case-by-case
              basis.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> How do I cancel my subscription?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              To cancel your We subscription, you can log in to your account and navigate to the
              subscription management page. From there, you should be able to cancel your subscription and stop
              future billing.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> Can I try this platform for free?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              We offers a free trial of its  platform for a limited time. During the trial period,
              you will have access to a limited set of features and functionality, but you will not be charged.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> Do you offer any discounts or promotions?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              We may offer discounts or promotions from time to time. To stay up-to-date on the latest
              deals and special offers, you can sign up for the company's newsletter or follow it on social media.
            </p>
          </details>
        </div>
        <div className="py-5">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              <span> How do we compare to other similar services?</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-neutral-600 mt-3 group-open:animate-fadeIn">
              This platform is a highly reliable and feature-rich service that offers a wide range
              of tools and functionality. It is competitively priced and offers a variety of billing options to
              suit different needs and budgets.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
