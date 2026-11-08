import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description:
    "How Upeo Africa Technologies uses cookies and similar technologies on its website, why they are used, how long they last, and how you can refuse the ones that are not required.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookies Policy"
      intro="This policy explains the cookies and similar storage this website uses, why each kind exists, how long it lasts, and how you can refuse the ones that are not required to use the site."
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
          on your device through your browser. It can remember a choice, keep a visit
          together, or recognise that the same browser has returned.
        </li>
        <li>
          <strong>&ldquo;Similar technologies&rdquo;</strong> means local storage, session
          storage, pixels, and tags that store or read information on your device without
          using a cookie file.
        </li>
        <li>
          <strong>&ldquo;Essential&rdquo;</strong> means a cookie or store that is required
          for something you asked the site to do, such as sending a form or keeping a
          checkout in progress.
        </li>
        <li>
          <strong>&ldquo;First-party&rdquo;</strong> means set by this website.{" "}
          <strong>&ldquo;Third-party&rdquo;</strong> means set by a measurement or advertising
          service named in this Policy, such as Google, Microsoft, or Meta.
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
        <strong>3.1</strong> This Policy covers {company.domain}. It does not govern cookies
        on other sites we link to, including a card or mobile-money page hosted by a payment
        provider. Those sites set their own cookies under their own policies.
      </p>
      <p>
        <strong>3.2</strong> Where we build or host a product for a client, cookies on that
        product are the client&rsquo;s responsibility unless a written agreement says
        otherwise.
      </p>

      <h2>4. What these technologies do</h2>
      <p>
        <strong>4.1</strong> A cookie is stored by your browser and can be read again on a
        later visit. Storage that stays only in the browser is used for the same kinds of
        jobs, such as remembering a cart, without being sent on every request.
      </p>
      <p>
        <strong>4.2</strong> We use them to complete a form or a purchase you started, to
        protect forms from automated abuse, to understand how the public site is used, and,
        where we have enabled advertising measurement, to see which visits lead to an
        enquiry, a booking, or a purchase.
      </p>
      <p>
        <strong>4.3</strong> We do not sell personal data collected this way. We do not use
        these technologies to make a decision about you, by automated means alone, that has
        a legal or similarly significant effect.
      </p>

      <h2>5. Categories</h2>
      <p>
        <strong>5.1</strong> We group what we use into four categories:
      </p>
      <ol>
        <li>
          <strong>Essential.</strong> Required for security or for a step you started. The
          site does not ask again before these, because that step cannot finish without them.
        </li>
        <li>
          <strong>Functional.</strong> Remembers something you did in this browser, such as
          the products in a cart, so the next step still works.
        </li>
        <li>
          <strong>Analytics.</strong> Records how the public pages are used, including
          session recordings, so we can see where a page is hard to follow.
        </li>
        <li>
          <strong>Advertising measurement.</strong> Used only when we switch on Google Ads
          or a Meta pixel. These cookies connect a visit with a later enquiry, booking, or
          purchase.
        </li>
      </ol>

      <h2>6. What runs on the public site</h2>
      <p>
        <strong>6.1</strong> The table names the technologies a visitor can meet on the
        public site, why they exist, and how long they usually last. A provider may refresh
        an entry when you return, which starts that period again.
      </p>
      <table>
        <thead>
          <tr>
            <th>Technology</th>
            <th>Category</th>
            <th>Purpose</th>
            <th>How long it lasts</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Site cookies and browser storage set by us</td>
            <td>Essential and functional</td>
            <td>
              Completes a form, holds a checkout that you started, and remembers products
              you placed in the cart on this browser. A short-lived security check confirms
              that a form was sent by a person.
            </td>
            <td>For the visit, or until you clear the cart or your browser data</td>
          </tr>
          <tr>
            <td>Microsoft Clarity</td>
            <td>Analytics</td>
            <td>
              Records pages, clicks, and scrolls on the public site, and can replay a visit
              so we can see where the page is unclear. Typical cookies include _clck, _clsk,
              and CLID.
            </td>
            <td>Session cookies for about a day. Recognition cookies for about 12 months</td>
          </tr>
          <tr>
            <td>Google Analytics</td>
            <td>Analytics</td>
            <td>
              Counts visits and pages when we enable it. It is not loaded twice if the same
              property already runs through Tag Manager. Typical cookies begin with _ga.
            </td>
            <td>Up to 2 years</td>
          </tr>
          <tr>
            <td>Google Tag Manager</td>
            <td>Analytics</td>
            <td>
              Loads the measurement tags we choose to publish. Any further cookie is then
              covered by this Policy.
            </td>
            <td>As set by the tags that are published</td>
          </tr>
          <tr>
            <td>Google Ads</td>
            <td>Advertising</td>
            <td>
              Measures whether a later enquiry, booking, or purchase followed an ad click,
              when we enable it. A typical cookie is _gcl_au.
            </td>
            <td>About 90 days</td>
          </tr>
          <tr>
            <td>Meta</td>
            <td>Advertising</td>
            <td>
              Measures visits and outcomes for a Meta pixel, when we enable it. Typical
              cookies are _fbp and, after an ad click, _fbc.
            </td>
            <td>About 90 days</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>6.2</strong> Microsoft may also set a cookie named MUID when Clarity loads.
        It recognises the browser across Microsoft properties. Microsoft publishes that
        lifetime as about 12 months.
      </p>
      <p>
        <strong>6.3</strong> Google Analytics, Tag Manager, Google Ads, and Meta stay off
        until we enable them. Clarity runs on the public pages. The cart and the form check
        run when you use those features.
      </p>

      <h2>7. Essential and functional use</h2>
      <p>
        <strong>7.1</strong> Essential use is limited to finishing a request you made and
        keeping forms from being submitted by automated scripts. It is not used to build an
        advertising profile.
      </p>
      <p>
        <strong>7.2</strong> If you block every cookie, a form may refuse to send until the
        security check can run, and a checkout may forget the products you had selected.
      </p>
      <p>
        <strong>7.3</strong> The cart stays in this browser until you remove those products,
        complete the order, or clear site data. It holds the product and the price you
        selected. It does not hold a card number.
      </p>

      <h2>8. Analytics</h2>
      <p>
        <strong>8.1</strong> Clarity records how the public pages are used, including device
        type and a replay of a session. We use that to improve the site. We do not use a
        recording to name you unless you have already given us your name in a form during
        that visit.
      </p>
      <p>
        <strong>8.2</strong> When Google Analytics is enabled, it counts visits, pages, and
        the country-level area of a browser. When Tag Manager is enabled, it loads the tags
        we have chosen. Those tags do not run unless we publish them.
      </p>

      <h2>9. Advertising measurement</h2>
      <p>
        <strong>9.1</strong> Google Ads and Meta cookies are set only when we enable those
        tools. Until then, they are not placed.
      </p>
      <p>
        <strong>9.2</strong> A confirmation page can tell an enabled measurement tool, once
        in that browser tab, that the visit ended in an enquiry, a subscription, a booking,
        a purchase, or a download. That notice does not include a card number.
      </p>
      <p>
        <strong>9.3</strong> An AdSense account line in the page, if we add one, verifies
        the site with Google. By itself it does not place an advertisement and it does not
        set an advertising cookie. If we later show AdSense units, we will update this
        Policy first, because those units would set their own advertising cookies.
      </p>

      <h2>10. Providers outside this website</h2>
      <p>
        <strong>10.1</strong> Google, Microsoft, and Meta process technical data under their
        own terms when their tools run. Some of them store that data outside Kenya. Transfers
        of personal data outside Kenya are made as described in the{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>11. Lawful basis</h2>
      <p>
        <strong>11.1</strong> Essential cookies and storage are used because they are
        necessary for a step you asked for, or to keep a form from being abused. That is a
        legitimate interest, and for a checkout it is also a step toward a contract.
      </p>
      <p>
        <strong>11.2</strong> Analytics and advertising cookies are used for our legitimate
        interests in understanding the site and in measuring whether a campaign led to an
        enquiry or a sale, where those interests are not overridden by your rights. Where the
        GDPR requires consent before a non-essential cookie, you may refuse it under clause
        12, and we treat a browser-level refusal as an objection to that processing.
      </p>

      <h2>12. How to refuse or delete cookies</h2>
      <p>
        <strong>12.1</strong> You can delete cookies and site data already stored, and you
        can set your browser to block some or all cookies. The control sits in the
        browser&rsquo;s privacy or site settings. Blocking every cookie also blocks the
        cookies a form or a checkout needs, so those steps may fail.
      </p>
      <p>
        <strong>12.2</strong> The main browsers publish their own steps:
      </p>
      <ul>
        <li>Google Chrome: Settings, Privacy and security, Third-party cookies.</li>
        <li>Mozilla Firefox: Settings, Privacy and Security, Cookies and Site Data.</li>
        <li>Apple Safari: Settings, Privacy, Manage Website Data.</li>
        <li>Microsoft Edge: Settings, Cookies and site permissions.</li>
      </ul>
      <p>
        <strong>12.3</strong> You can also opt out of particular providers:
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
          .
        </li>
        <li>
          Microsoft Clarity: block cookies from clarity.ms in your browser, or use{" "}
          <a href="https://account.microsoft.com/privacy/ad-settings" rel="noopener noreferrer">
            Microsoft privacy settings
          </a>
          .
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
        <strong>12.4</strong> A private or incognito window drops session cookies and session
        storage when you close it. Some stored data can remain, depending on the browser.
      </p>
      <p>
        <strong>12.5</strong> Signals such as Global Privacy Control or &ldquo;Do Not
        Track&rdquo; are not honoured in a uniform way by every provider named here. The
        reliable control is the browser setting or the provider opt-out above.
      </p>

      <h2>13. Retention</h2>
      <p>
        <strong>13.1</strong> A cookie expires at the end of the period in clause 6, or sooner
        if you delete it. Records of a visit that we keep on our side are held only as long
        as the <a href="/privacy">Privacy Policy</a> allows, and are then deleted or
        aggregated.
      </p>

      <h2>14. Children</h2>
      <p>
        <strong>14.1</strong> The website is not directed at children under eighteen (18). We
        do not knowingly use cookies to profile children.
      </p>

      <h2>15. Changes to this Policy</h2>
      <p>
        <strong>15.1</strong> We will update this Policy when we add or remove a technology
        named here. The new text applies from the date it is published, and the &ldquo;Last
        updated&rdquo; date will change. A material addition, such as showing advertisements
        on the site, will be described in this Policy before it takes effect.
      </p>

      <h2>16. Governing law</h2>
      <p>
        <strong>16.1</strong> This Policy is governed by the laws of the Republic of Kenya,
        without reducing any additional rights you have under the GDPR where it applies.
      </p>

      <h2>17. Contact</h2>
      <p>
        Questions about cookies may be sent to {company.legalName}, {company.addressLine}, or
        by email to <a href={`mailto:${company.email}`}>{company.email}</a>. You may also read
        the <a href="/privacy">Privacy Policy</a> and the{" "}
        <a href="/terms">Terms of Service</a>.
      </p>
    </LegalLayout>
  );
}
