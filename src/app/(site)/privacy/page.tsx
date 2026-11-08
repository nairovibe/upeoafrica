import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Upeo Africa Technologies Ltd collects, uses, discloses, and protects personal data, in compliance with the Kenya Data Protection Act, 2019 and the EU General Data Protection Regulation (GDPR).",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="This policy explains what personal data Upeo Africa Technologies collects when you use our website or engage us for work, why we hold it, how we protect it, and the rights you can exercise over it at any time."
      effective="1 September 2026"
      updated="7 November 2026"
      activeHref="/privacy"
    >
      <p className="lead">
        This Privacy Policy (&ldquo;Policy&rdquo;) describes how {company.legalName} (&ldquo;Upeo
        Africa&rdquo;, the &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or
        &ldquo;our&rdquo;), a limited liability company incorporated in the Republic of
        Kenya, collects, uses, stores, discloses, transfers and otherwise processes personal
        data. This Policy is issued in accordance with the Constitution of Kenya, 2010, the
        Data Protection Act, No. 24 of 2019 (the &ldquo;Act&rdquo;) and its subsidiary
        regulations, and, where applicable, Regulation (EU) 2016/679 (the General Data
        Protection Regulation or &ldquo;GDPR&rdquo;). By accessing our website or engaging
        our services, you acknowledge that you have read and understood this Policy.
      </p>

      <h2>1. Interpretation and definitions</h2>
      <p>
        <strong>1.1</strong> In this Policy, unless the context otherwise requires, the
        following expressions bear the meanings assigned to them under the Act and the GDPR:
      </p>
      <ul>
        <li>
          <strong>&ldquo;Data Controller&rdquo;</strong> means the natural or legal person
          who, alone or jointly with others, determines the purpose and means of processing
          personal data; in respect of this Policy, the Data Controller is the Company.
        </li>
        <li>
          <strong>&ldquo;Data Processor&rdquo;</strong> means a natural or legal person who
          processes personal data on behalf of the Data Controller.
        </li>
        <li>
          <strong>&ldquo;Data Subject&rdquo;</strong> means an identified or identifiable
          natural person who is the subject of personal data.
        </li>
        <li>
          <strong>&ldquo;Personal Data&rdquo;</strong> means any information relating to an
          identified or identifiable natural person.
        </li>
        <li>
          <strong>&ldquo;Processing&rdquo;</strong> means any operation performed on personal
          data, whether or not by automated means.
        </li>
        <li>
          <strong>&ldquo;Sensitive Personal Data&rdquo;</strong> means data revealing a
          person&rsquo;s race, health status, ethnic or social origin, conscience, belief,
          genetic or biometric data, property details, marital status, family details, sex
          or sexual orientation.
        </li>
        <li>
          <strong>&ldquo;ODPC&rdquo;</strong> means the Office of the Data Protection
          Commissioner established under the Act.
        </li>
      </ul>
      <p>
        <strong>1.2</strong> Headings are for convenience only and do not affect the
        interpretation of this Policy. Words importing the singular include the plural and
        vice versa.
      </p>

      <h2>2. Data Controller and Data Protection Officer</h2>
      <p>
        <strong>2.1</strong> The Data Controller responsible for your personal data is{" "}
        {company.legalName}, of {company.addressLine}, Kenya.
      </p>
      <p>
        <strong>2.2</strong> Questions, requests, or complaints regarding this Policy or the
        processing of your personal data may be directed to our Data Protection Officer by
        email at <a href={`mailto:${company.email}`}>{company.email}</a> or by writing to the
        address stated in clause 2.1.
      </p>

      <h2>3. Scope</h2>
      <p>
        <strong>3.1</strong> This Policy applies to all personal data processed by the
        Company in connection with our website, our communications, and the provision of our
        software development, design, branding, and digital marketing services (the
        &ldquo;Services&rdquo;).
      </p>
      <p>
        <strong>3.2</strong> Where we process personal data on behalf of a client in the
        course of delivering the Services, we do so as a Data Processor, and such processing
        is governed by the data processing terms of the relevant client agreement rather
        than this Policy.
      </p>

      <h2>4. Personal data we collect</h2>
      <p>
        <strong>4.1</strong> Depending on your interaction with us, we may collect and
        process the following categories of personal data:
      </p>
      <ul>
        <li>
          <strong>Identity and contact data</strong>: your name, job title, employer,
          email address, telephone number and postal address.
        </li>
        <li>
          <strong>Enquiry and engagement data</strong>: the contents of enquiry forms,
          proposals, correspondence, project requirements and instructions you provide.
        </li>
        <li>
          <strong>Financial and transaction data</strong>: billing details and records of
          payments to and from you (we do not store full card numbers).
        </li>
        <li>
          <strong>Technical and usage data</strong>: internet protocol (IP) address,
          browser type and version, device information, pages viewed, and the dates and
          times of your visits, collected only if measurement tools are enabled as described
          in section 7.
        </li>
        <li>
          <strong>Marketing and communications data</strong>: your preferences in receiving
          communications from us, including the email address you give when you join the
          mailing list.
        </li>
      </ul>
      <p>
        <strong>4.2</strong> We do not intentionally collect Sensitive Personal Data through
        our website. Where such data is necessary for a specific engagement, we process it
        only with your explicit consent or another lawful basis under section 30 of the Act
        and Article 9 of the GDPR.
      </p>

      <h2>5. How we collect personal data</h2>
      <p>We collect personal data:</p>
      <ol>
        <li>
          directly from you, when you complete a form, request a proposal, correspond with
          us, or engage our Services;
        </li>
        <li>
          automatically, through cookies and similar technologies, when you interact with
          our website; and
        </li>
        <li>
          from third parties, such as our analytics providers and publicly available
          business sources, where lawful.
        </li>
      </ol>

      <h2>6. Purposes and lawful bases of processing</h2>
      <p>
        <strong>6.1</strong> We process personal data only where the Act and the GDPR permit.
        The lawful bases on which we rely are: (a) your consent; (b) the performance of a
        contract with you or to take steps at your request prior to entering a contract; (c)
        compliance with a legal obligation; and (d) our legitimate interests, provided these
        are not overridden by your rights and freedoms.
      </p>
      <p>
        <strong>6.2</strong> We process personal data for the following purposes:
      </p>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Responding to enquiries and providing requested information</td>
            <td>Consent; steps prior to a contract</td>
          </tr>
          <tr>
            <td>Providing, managing and delivering the Services</td>
            <td>Performance of a contract</td>
          </tr>
          <tr>
            <td>Invoicing, accounting and recovering sums due</td>
            <td>Contract; legal obligation; legitimate interests</td>
          </tr>
          <tr>
            <td>Operating, securing and improving our website</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Sending relevant marketing communications</td>
            <td>Consent; legitimate interests</td>
          </tr>
          <tr>
            <td>Meeting legal, tax, and regulatory obligations</td>
            <td>Legal obligation</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Cookies and similar technologies</h2>
      <p>
        <strong>7.1</strong> Essential cookies are used to keep a staff session on the
        staff desk at /console. These are strictly necessary to operate that area of the
        site and are not used for advertising.
      </p>
      <p>
        <strong>7.2</strong> When a measurement ID is saved in site settings, the public
        website loads that tool. Google Analytics, Google Tag Manager, Google Ads, Meta,
        and Microsoft Clarity may place cookies that record how the site is used and which
        visits lead to an enquiry, a booking, or a purchase. You may refuse non-essential
        cookies in your browser. Refusing essential cookies may prevent staff from signing
        in to the desk.
      </p>

      <h2>8. Disclosure of personal data</h2>
      <p>
        <strong>8.1</strong> We do not sell your personal data. We may disclose personal data
        to the following categories of recipients:
      </p>
      <ul>
        <li>
          service providers and Data Processors who host our systems, deliver email, provide
          analytics, and support our operations, under written contracts imposing confidentiality
          and data protection obligations consistent with the Act and the GDPR;
        </li>
        <li>professional advisers, including lawyers, auditors, and accountants;</li>
        <li>
          public authorities, regulators or courts, where required by law or to establish,
          exercise, or defend legal claims; and
        </li>
        <li>
          a successor entity in the event of a merger, acquisition, or reorganisation of the
          Company.
        </li>
      </ul>

      <h2>9. International transfers of personal data</h2>
      <p>
        <strong>9.1</strong> Some of our service providers are located outside Kenya. Where we
        transfer personal data outside Kenya, we do so in accordance with section 48 and
        section 49 of the Act, and, in respect of data subject to the GDPR, only where an
        adequate level of protection is ensured, including through adequacy decisions, Standard
        Contractual Clauses, or your explicit consent.
      </p>

      <h2>10. Data retention</h2>
      <p>
        <strong>10.1</strong> We retain personal data only for as long as necessary to fulfil
        the purposes for which it was collected, including to satisfy any legal, accounting,
        contractual, or reporting requirements. Financial records are retained for a minimum
        of seven (7) years in accordance with applicable tax law.
      </p>
      <p>
        <strong>10.2</strong> When personal data is no longer required, we securely delete or
        anonymise it.
      </p>

      <h2>11. Data security</h2>
      <p>
        <strong>11.1</strong> We implement appropriate technical and organisational measures to
        protect personal data against unauthorised or unlawful processing, accidental loss,
        destruction, or damage, including access controls, encryption in transit, regular
        backups, and staff confidentiality obligations.
      </p>
      <p>
        <strong>11.2</strong> In the event of a personal data breach that is likely to result in
        a risk to your rights and freedoms, we will notify the ODPC and, where required,
        affected data subjects without undue delay and, where feasible, within seventy-two (72)
        hours of becoming aware of the breach.
      </p>

      <h2>12. Your rights as a data subject</h2>
      <p>
        <strong>12.1</strong> Subject to the Act and the GDPR, you have the right to:
      </p>
      <ol>
        <li>be informed of the use to which your personal data is put;</li>
        <li>access your personal data in our custody;</li>
        <li>request correction or rectification of inaccurate or incomplete data;</li>
        <li>
          request erasure or deletion of personal data that we are no longer authorised to
          retain;
        </li>
        <li>object to or restrict the processing of your personal data;</li>
        <li>data portability, where technically feasible;</li>
        <li>withdraw consent at any time, without affecting prior lawful processing; and</li>
        <li>
          not be subject to a decision based solely on automated processing that produces
          legal or similarly significant effects.
        </li>
      </ol>

      <h2>13. Exercising your rights</h2>
      <p>
        <strong>13.1</strong> You may exercise any of the rights in clause 12 by contacting our
        Data Protection Officer using the details in clause 2. We will respond within the
        timelines prescribed by the Act and the GDPR, ordinarily within thirty (30) days. We may
        require verification of your identity before acting on a request.
      </p>

      <h2>14. Direct marketing</h2>
      <p>
        <strong>14.1</strong> We send marketing communications only where you have consented,
        including when you join the mailing list on this website, or where permitted by law. You
        may opt out at any time by using the unsubscribe mechanism in our communications or by
        contacting us.
      </p>

      <h2>15. Children&rsquo;s personal data</h2>
      <p>
        <strong>15.1</strong> Our website and Services are not directed at children under the age
        of eighteen (18), and we do not knowingly collect their personal data without the consent
        of a parent or guardian.
      </p>

      <h2>16. Complaints</h2>
      <p>
        <strong>16.1</strong> If you are dissatisfied with how we have handled your personal data,
        you may lodge a complaint with us in the first instance. You also have the right to lodge
        a complaint with the Office of the Data Protection Commissioner of Kenya, and, where the
        GDPR applies, with your local supervisory authority.
      </p>

      <h2>17. Changes to this Policy</h2>
      <p>
        <strong>17.1</strong> We may amend this Policy from time to time. The revised Policy takes
        effect on the date it is published on this website, and the &ldquo;Last updated&rdquo; date
        will be revised accordingly.
      </p>

      <h2>18. Governing law</h2>
      <p>
        <strong>18.1</strong> This Policy is governed by and construed in accordance with the laws
        of the Republic of Kenya, without prejudice to the additional protections afforded to data
        subjects under the GDPR where it applies.
      </p>

      <h2>19. Contact us</h2>
      <p>
        Any questions concerning this Policy may be addressed to the Data Protection Officer,{" "}
        {company.legalName}, {company.addressLine}, or by email to{" "}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    </LegalLayout>
  );
}
