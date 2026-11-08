import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description:
    "How Upeo Africa Technologies uses cookies, local storage, and similar technologies on its website, including what each one does and how to refuse non-essential cookies.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookies Policy"
      intro="This policy lists the cookies and similar storage this website uses, why each one exists, how long it lasts, and how you can refuse the ones that are not required to run the site."
      effective="8 November 2026"
      updated="8 November 2026"
      activeHref="/cookies"
    >
      <p className="lead">
        This Cookies Policy (&ldquo;Policy&rdquo;) explains how {company.legalName}{" "}
        (&ldquo;Upeo Africa&rdquo;, the &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;
        or &ldquo;our&rdquo;), a limited liability company incorporated in the Republic of
        Kenya, uses cookies and similar technologies on {company.domain}. It is issued
        together with our <a href="/privacy">Privacy Policy</a> and should be read with it.
        It is prepared with regard to the Data Protection Act, No. 24 of 2019 (the
        &ldquo;Act&rdquo;) and, where applicable, Regulation (EU) 2016/679 (the
        &ldquo;GDPR&rdquo;) and the ePrivacy rules that sit alongside it.
      </p>

      <h2>1. Interpretation and definitions</h2>
      <p>
        <strong>1.1</strong> In this Policy, unless the context otherwise requires:
      </p>
      <ul>
        <li>
          <strong>&ldquo;Cookie&rdquo;</strong> means a small text file that a website places
          on your device through your browser. A cookie can remember a setting, keep a
          session, or recognise that the same browser has returned.
        </li>
        <li>
          <strong>&ldquo;Similar technologies&rdquo;</strong> means local storage, session
          storage, pixels, and tags that store or read information on your device without
          using a cookie file.
        </li>
        <li>
          <strong>&ldquo;Essential&rdquo;</strong> means a cookie or store that is required
          for a service you asked for, such as a staff sign-in or a security check on a form.
        </li>
        <li>
          <strong>&ldquo;First-party&rdquo;</strong> means set by this website.{" "}
          <strong>&ldquo;Third-party&rdquo;</strong> means set by a provider we use, such as
          Microsoft, Google, Meta, Supabase, or Cloudflare.
        </li>
        <li>
          <strong>&ldquo;Identifier&rdquo;</strong> means a measurement or advertising ID
          that we save in the site settings before the matching tool is allowed to load.
        </li>
      </ul>
      <p>
        <strong>1.2</strong> Headings are for convenience only. Words in the singular include
        the plural and the reverse.
      </p>

      <h2>2. Who this policy is from</h2>
      <p>
        <strong>2.1</strong> The controller of personal data collected through these
        technologies is {company.legalName}, of {company.addressLine}, Kenya.
      </p>
      <p>
        <strong>2.2</strong> Questions about this Policy may be sent to{" "}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>

      <h2>3. Scope</h2>
      <p>
        <strong>3.1</strong> This Policy covers the public website and the staff desk at
        /console. It does not govern cookies on third-party sites that we link to, including
        payment pages hosted by PayPal or a mobile-money provider. Those sites set their own
        cookies under their own policies.
      </p>
      <p>
        <strong>3.2</strong> Where we build or host a product for a client, cookies on that
        product are the client&rsquo;s responsibility unless a written agreement says
        otherwise.
      </p>

      <h2>4. What these technologies do</h2>
      <p>
        <strong>4.1</strong> A cookie is stored by your browser and sent back to the site on
        later requests. Session storage and local storage stay in the browser and are not
        sent with every request. We use both.
      </p>
      <p>
        <strong>4.2</strong> We use them to keep a staff session, remember a cart, confirm
        that a form was sent by a person, understand how the public site is used, and, only
        where an advertising identifier is saved, measure which visits lead to an enquiry, a
        booking, or a purchase.
      </p>
      <p>
        <strong>4.3</strong> We do not sell personal data collected through cookies. We do
        not use cookies to make a decision that has a legal or similarly significant effect
        on you by automated means alone.
      </p>

      <h2>5. Categories</h2>
      <p>
        <strong>5.1</strong> We group what we use into four categories:
      </p>
      <ol>
        <li>
          <strong>Essential.</strong> Required for security, sign-in, or a feature you
          started. The site does not ask for consent before these, because the service
          cannot function without them.
        </li>
        <li>
          <strong>Functional.</strong> Remembers something you did on this browser, such as
          the products in a cart or the source of a visit, so the next step still works.
        </li>
        <li>
          <strong>Analytics.</strong> Records how pages are used, including session
          recordings from Microsoft Clarity, so we can see where the site is unclear.
        </li>
        <li>
          <strong>Advertising and conversion measurement.</strong> Loaded only after we save
          a Google Ads identifier or a Meta pixel identifier. These cookies connect a visit
          with a later enquiry, booking, or purchase.
        </li>
      </ol>

      <h2>6. The list</h2>
      <p>
        <strong>6.1</strong> The table below is the list in use on the date of this Policy.
        Durations are those set by us or published by the provider. A provider may refresh a
        cookie when you return, which starts the period again.
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Who sets it</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>How long it lasts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>upeo-console-remember</td>
            <td>Upeo Africa</td>
            <td>Essential</td>
            <td>Remembers that a staff member asked the desk to keep them signed in.</td>
            <td>14 days, or until sign-out</td>
          </tr>
          <tr>
            <td>Cookies whose names begin with sb-</td>
            <td>Supabase, our authentication host</td>
            <td>Essential</td>
            <td>Keeps a signed-in staff session on the desk. Visitors who are not staff do not receive these.</td>
            <td>The browser session, or up to 14 days if &ldquo;remember&rdquo; is chosen</td>
          </tr>
          <tr>
            <td>Cloudflare Turnstile</td>
            <td>Cloudflare</td>
            <td>Essential</td>
            <td>Checks that an enquiry, checkout, ticket, newsletter, or founder form was submitted by a person.</td>
            <td>For the duration of the check</td>
          </tr>
          <tr>
            <td>upeo-admin-nav</td>
            <td>Upeo Africa, in local storage</td>
            <td>Essential</td>
            <td>Remembers whether the staff menu is collapsed. It is stored only in a browser that has opened the desk.</td>
            <td>Until you clear site data</td>
          </tr>
          <tr>
            <td>upeo-product-cart</td>
            <td>Upeo Africa, in local storage</td>
            <td>Functional</td>
            <td>Keeps the products you added to the cart on this browser.</td>
            <td>Until the cart is cleared, the order completes, or you clear site data</td>
          </tr>
          <tr>
            <td>upeo-thanks</td>
            <td>Upeo Africa, in session storage</td>
            <td>Functional</td>
            <td>Lets the confirmation page show the result of a booking, purchase, or download in that tab, and stops the same confirmation being counted twice.</td>
            <td>Until the tab is closed</td>
          </tr>
          <tr>
            <td>upeo:lead-context</td>
            <td>Upeo Africa, in session storage</td>
            <td>Functional</td>
            <td>Keeps the campaign parameters and referring page from the visit so an enquiry can be attributed to its source.</td>
            <td>Until the tab is closed</td>
          </tr>
          <tr>
            <td>_clck</td>
            <td>Microsoft Clarity</td>
            <td>Analytics</td>
            <td>Recognises a returning browser so recordings of the public site can be understood across visits.</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>_clsk</td>
            <td>Microsoft Clarity</td>
            <td>Analytics</td>
            <td>Connects page views from the same visit into one session.</td>
            <td>1 day</td>
          </tr>
          <tr>
            <td>CLID</td>
            <td>Microsoft Clarity</td>
            <td>Analytics</td>
            <td>Records the first time Clarity saw this browser.</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>_ga and _ga_ followed by an identifier</td>
            <td>Google Analytics</td>
            <td>Analytics</td>
            <td>Distinguishes browsers and measures page views. Loaded only when a measurement ID is saved in site settings, and not when the same property already runs inside Tag Manager.</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td>Google Tag Manager</td>
            <td>Google</td>
            <td>Analytics</td>
            <td>Loads other tags we have placed in the container. Loaded only when a container ID is saved. Those tags may set further cookies, which then fall under this Policy.</td>
            <td>As set by the tags in the container</td>
          </tr>
          <tr>
            <td>_gcl_au</td>
            <td>Google Ads</td>
            <td>Advertising</td>
            <td>Measures whether a later enquiry, booking, or purchase followed an ad click. Loaded only when a Google Ads identifier is saved.</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>_fbp and, after an ad click, _fbc</td>
            <td>Meta</td>
            <td>Advertising</td>
            <td>Measures visits and conversions for a Meta pixel. Loaded only when a pixel identifier is saved.</td>
            <td>90 days</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>6.2</strong> Microsoft may also set a cookie named MUID when Clarity loads.
        It is used to recognise the browser across Microsoft properties. We do not control
        its lifetime. Microsoft publishes that lifetime as about 12 months.
      </p>

      <h2>7. Essential cookies</h2>
      <p>
        <strong>7.1</strong> Essential cookies and stores are limited to the staff desk, the
        form security check, and the operation of a request you started. They are not used
        to build an advertising profile.
      </p>
      <p>
        <strong>7.2</strong> If you block essential cookies, staff cannot stay signed in, and
        a form may refuse to send until the security check can run.
      </p>

      <h2>8. Functional storage</h2>
      <p>
        <strong>8.1</strong> The cart, the confirmation page, and the campaign source of a
        visit are kept in local storage or session storage on your device. They are not sent
        to an advertising network. The cart holds the product, the licence, and the price
        you selected. It does not hold your card number.
      </p>
      <p>
        <strong>8.2</strong> Clearing site data for this website removes the cart and the
        stored campaign source.
      </p>

      <h2>9. Analytics</h2>
      <p>
        <strong>9.1</strong> Microsoft Clarity runs on the public pages. It records pages
        viewed, clicks, scrolls, and device type, and it can record a replay of a session
        so we can see where a page is hard to use. Recordings are used to improve the site.
        We do not use them to identify you by name unless you have already given us that
        name in a form during the same visit.
      </p>
      <p>
        <strong>9.2</strong> Google Analytics loads only after we save a measurement ID that
        begins with G-. It counts visits, pages, and roughly where a browser is located at
        country level. If Tag Manager is already loading that same property, we do not load
        Analytics a second time.
      </p>
      <p>
        <strong>9.3</strong> Google Tag Manager loads only after we save a container ID that
        begins with GTM-. Tag Manager is a loader. The cookies it causes depend on the tags
        placed inside the container.
      </p>

      <h2>10. Advertising and conversion measurement</h2>
      <p>
        <strong>10.1</strong> Google Ads cookies load only after we save an identifier that
        begins with AW-. Meta cookies load only after we save a numeric pixel identifier.
        Until those identifiers are saved, those cookies are not set.
      </p>
      <p>
        <strong>10.2</strong> A confirmation page can send one conversion event for an
        enquiry, a subscription, a ticket, a paid product, or a free download. The event is
        fired once in that tab. It tells the saved advertising or analytics tool that the
        visit reached that outcome. It does not include a card number.
      </p>
      <p>
        <strong>10.3</strong> The AdSense account meta tag, when saved, is a verification
        line in the page head. By itself it does not place an advertisement and it does not
        set an advertising cookie. If we later publish AdSense units on the site, we will
        update this Policy before those units go live, because AdSense would then set its
        own advertising cookies.
      </p>

      <h2>11. Third-party providers</h2>
      <p>
        <strong>11.1</strong> Clarity, Google, Meta, Supabase, and Cloudflare process
        technical data under their own terms when their tools run. Some of them are outside
        Kenya. Transfers of personal data outside Kenya are made as described in the{" "}
        <a href="/privacy">Privacy Policy</a>, including section 48 and section 49 of the Act
        and, where the GDPR applies, an appropriate safeguard.
      </p>
      <p>
        <strong>11.2</strong> We do not permit those providers to use data from this site for
        their own independent advertising except to the extent their standard tools do so
        when you have not opted out, and except where an advertising identifier has been
        saved by us for measurement.
      </p>

      <h2>12. Lawful basis</h2>
      <p>
        <strong>12.1</strong> Essential cookies and stores are used because they are necessary
        to provide a service you requested, or to keep the staff desk secure. That is a
        legitimate interest and, for a signed-in session, performance of the staff relationship.
      </p>
      <p>
        <strong>12.2</strong> Functional storage for a cart or a confirmation is necessary to
        take the step you asked for.
      </p>
      <p>
        <strong>12.3</strong> Analytics and advertising cookies are used for our legitimate
        interests in understanding and improving the site and in measuring whether a campaign
        led to an enquiry or a sale, where those interests are not overridden by your rights.
        Where the GDPR requires consent before a non-essential cookie, you may refuse that
        cookie as set out in clause 13, and we will treat a browser-level refusal as an
        objection to that processing.
      </p>

      <h2>13. How to refuse or delete cookies</h2>
      <p>
        <strong>13.1</strong> You can remove cookies and site data already stored, and you can
        set your browser to block some or all cookies. The control sits in the browser&rsquo;s
        privacy or site settings. Blocking every cookie will also block essential cookies, and
        the staff desk and some forms will then fail.
      </p>
      <p>
        <strong>13.2</strong> Current instructions from the main browsers are published by
        their makers:
      </p>
      <ul>
        <li>Google Chrome: Settings, Privacy and security, Third-party cookies;</li>
        <li>Mozilla Firefox: Settings, Privacy and Security, Cookies and Site Data;</li>
        <li>Apple Safari: Settings, Privacy, Manage Website Data;</li>
        <li>Microsoft Edge: Settings, Cookies and site permissions.</li>
      </ul>
      <p>
        <strong>13.3</strong> You can also opt out of particular providers:
      </p>
      <ul>
        <li>
          Google Analytics and Google Ads:{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer">
            the Google Analytics opt-out
          </a>{" "}
          and{" "}
          <a href="https://adssettings.google.com/" rel="noopener noreferrer">
            Google ad settings
          </a>
          ;
        </li>
        <li>
          Microsoft Clarity: block cookies from clarity.ms in your browser, or use{" "}
          <a href="https://account.microsoft.com/privacy/ad-settings" rel="noopener noreferrer">
            Microsoft privacy settings
          </a>
          ;
        </li>
        <li>
          Meta:{" "}
          <a href="https://www.facebook.com/settings?tab=ads" rel="noopener noreferrer">
            Meta ad preferences
          </a>
          .
        </li>
      </ul>
      <p>
        <strong>13.4</strong> A private or incognito window drops session cookies and session
        storage when you close it. Local storage and some persistent cookies can remain,
        depending on the browser.
      </p>
      <p>
        <strong>13.5</strong> Signals such as Global Privacy Control or &ldquo;Do Not
        Track&rdquo; are not honoured in a uniform way by every provider we use. The reliable
        control is the browser setting or the provider opt-out above.
      </p>

      <h2>14. Retention</h2>
      <p>
        <strong>14.1</strong> A cookie expires at the end of the period in clause 6, or sooner
        if you delete it. Server logs that record an IP address from a visit are kept only as
        long as needed for security and are then deleted or aggregated, as described in the
        Privacy Policy.
      </p>

      <h2>15. Children</h2>
      <p>
        <strong>15.1</strong> The website is not directed at children under eighteen (18). We
        do not knowingly use cookies to profile children.
      </p>

      <h2>16. Changes to this Policy</h2>
      <p>
        <strong>16.1</strong> We will update this Policy when we add or remove a cookie or a
        provider. The new text applies from the date it is published here, and the &ldquo;Last
        updated&rdquo; date will change. A material addition, such as publishing AdSense units,
        will be described in clause 10 or in a new clause before it takes effect.
      </p>

      <h2>17. Governing law</h2>
      <p>
        <strong>17.1</strong> This Policy is governed by the laws of the Republic of Kenya,
        without reducing any additional rights you have under the GDPR where it applies.
      </p>

      <h2>18. Contact</h2>
      <p>
        Questions about cookies may be sent to {company.legalName}, {company.addressLine}, or
        by email to <a href={`mailto:${company.email}`}>{company.email}</a>. You may also read
        the <a href="/privacy">Privacy Policy</a> and the{" "}
        <a href="/terms">Terms of Service</a>.
      </p>
    </LegalLayout>
  );
}
