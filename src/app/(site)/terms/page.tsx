import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing the use of the Upeo Africa Technologies website and the provision of its services, governed by the laws of the Republic of Kenya.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="These are the terms you agree to when you use our website or engage Upeo Africa Technologies for work. They cover how projects are quoted and paid for, who owns what we build, and how either of us can end an engagement."
      effective="1 September 2026"
      updated="23 August 2026"
      activeHref="/terms"
    >
      <p className="lead">
        These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement
        between {company.legalName}, a limited liability company incorporated in the Republic
        of Kenya of {company.addressLine} (&ldquo;Upeo Africa&rdquo;, the &ldquo;Company&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), and any person or entity who
        accesses our website or engages our services (the &ldquo;Client&rdquo;, &ldquo;you&rdquo;
        or &ldquo;your&rdquo;). By accessing the website or engaging the Services you agree to be
        bound by these Terms. If you do not agree, you must not use the website or the Services.
      </p>

      <h2>1. Interpretation and definitions</h2>
      <p>
        <strong>1.1</strong> In these Terms, unless the context otherwise requires:
      </p>
      <ul>
        <li>
          <strong>&ldquo;Agreement&rdquo;</strong> means these Terms together with any Proposal,
          Statement of Work, or written agreement executed between the parties;
        </li>
        <li>
          <strong>&ldquo;Deliverables&rdquo;</strong> means the works, materials, software, and
          outputs to be delivered by the Company under an engagement;
        </li>
        <li>
          <strong>&ldquo;Intellectual Property Rights&rdquo;</strong> means all patents, copyrights,
          database rights, design rights, trademarks, trade secrets, and all other intellectual
          property rights, whether registered or unregistered;
        </li>
        <li>
          <strong>&ldquo;Proposal&rdquo;</strong> means a written proposal, quotation, or Statement
          of Work issued by the Company describing the scope, timelines, and fees for an engagement;
          and
        </li>
        <li>
          <strong>&ldquo;Services&rdquo;</strong> means the software development, design, branding,
          digital marketing, and related services provided by the Company.
        </li>
      </ul>
      <p>
        <strong>1.2</strong> A reference to a statute or statutory provision is a reference to it as
        amended, extended, or re-enacted from time to time. Headings do not affect interpretation.
      </p>

      <h2>2. Agreement and acceptance</h2>
      <p>
        <strong>2.1</strong> These Terms govern your use of the website at all times. Specific
        engagements for Services are governed by these Terms together with the applicable Proposal
        or Statement of Work, which together form the Agreement.
      </p>
      <p>
        <strong>2.2</strong> Where there is a conflict between these Terms and an executed Proposal
        or Statement of Work, the executed document prevails to the extent of the conflict.
      </p>

      <h2>3. The Services</h2>
      <p>
        <strong>3.1</strong> The Company shall provide the Services with reasonable skill and care,
        in accordance with the scope set out in the applicable Proposal.
      </p>
      <p>
        <strong>3.2</strong> Information on the website is provided for general information only and
        does not constitute a binding offer. The scope, timelines, and fees for any Services are
        confirmed in a Proposal prior to commencement.
      </p>

      <h2>4. Proposals and engagement</h2>
      <p>
        <strong>4.1</strong> Each engagement commences upon the Client&rsquo;s written acceptance of
        a Proposal, or upon payment of any deposit specified in the Proposal, whichever is earlier.
      </p>
      <p>
        <strong>4.2</strong> Any change to an agreed scope shall be documented in a written change
        request and may affect the fees and timelines, which shall be confirmed before the change is
        implemented.
      </p>

      <h2>5. Client obligations</h2>
      <p>
        <strong>5.1</strong> The Client shall: (a) provide, in a timely manner, all information,
        materials, access, and approvals reasonably required by the Company; (b) ensure the accuracy
        and lawfulness of all materials it provides; and (c) obtain and maintain all licences and
        consents necessary for the Company to perform the Services.
      </p>
      <p>
        <strong>5.2</strong> The Company is not liable for any delay or failure to perform to the
        extent caused by the Client&rsquo;s failure to meet its obligations under clause 5.1.
      </p>

      <h2>6. Fees, invoicing and payment</h2>
      <p>
        <strong>6.1</strong> Fees are as stated in the applicable Proposal and are exclusive of
        Value Added Tax (VAT) and other applicable taxes, which shall be charged in addition where
        applicable.
      </p>
      <p>
        <strong>6.2</strong> Unless otherwise stated, invoices are payable within fourteen (14) days
        of the invoice date. Time for payment is of the essence.
      </p>
      <p>
        <strong>6.3</strong> Without prejudice to any other right, the Company may charge interest on
        overdue amounts at the rate of two per cent (2%) per month, or the maximum rate permitted by
        law, accruing daily from the due date until payment, and may suspend the Services until all
        overdue amounts are paid.
      </p>

      <h2>7. Intellectual property rights</h2>
      <p>
        <strong>7.1</strong> Subject to full payment of all sums due under the relevant engagement,
        the Company assigns to the Client the Intellectual Property Rights in the Deliverables
        created specifically for the Client, save for the Retained Materials described in clause 7.2.
      </p>
      <p>
        <strong>7.2</strong> The Company retains all Intellectual Property Rights in its pre-existing
        materials, tools, frameworks, methodologies, and know-how (&ldquo;Retained Materials&rdquo;).
        To the extent Retained Materials are embedded in the Deliverables, the Company grants the
        Client a non-exclusive, perpetual, royalty-free licence to use them as part of the
        Deliverables.
      </p>
      <p>
        <strong>7.3</strong> Until full payment is received, the Company retains all Intellectual
        Property Rights in the Deliverables. All content, branding, and materials on the website
        remain the property of the Company.
      </p>

      <h2>8. Third-party and open-source materials</h2>
      <p>
        <strong>8.1</strong> The Deliverables may incorporate third-party or open-source components
        licensed under their own terms. The Client&rsquo;s use of such components is subject to those
        terms, and the Company gives no warranty in respect of third-party materials beyond passing
        on the benefit of any warranty it is able to.
      </p>

      <h2>9. Confidentiality</h2>
      <p>
        <strong>9.1</strong> Each party shall keep confidential all non-public information disclosed
        by the other in connection with the Agreement and shall use it only for the purpose of
        performing its obligations. This obligation survives termination for a period of five (5)
        years and does not apply to information that is or becomes public through no breach, or that
        is required to be disclosed by law.
      </p>

      <h2>10. Data protection</h2>
      <p>
        <strong>10.1</strong> Each party shall comply with the Data Protection Act, No. 24 of 2019
        and, where applicable, the GDPR. Where the Company processes personal data on behalf of the
        Client, it does so as a Data Processor in accordance with the data processing terms of the
        engagement. Our handling of personal data is further described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>11. Warranties</h2>
      <p>
        <strong>11.1</strong> The Company warrants that the Services will be performed with
        reasonable skill and care and that the Deliverables will materially conform to the agreed
        specification for a period of thirty (30) days from acceptance. The Company&rsquo;s sole
        obligation for a valid warranty claim is to remedy the defect at no additional cost.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        <strong>12.1</strong> Except as expressly stated in the Agreement, and to the fullest extent
        permitted by law, all warranties, conditions, and terms implied by statute or common law are
        excluded. The website and its content are provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranty of any kind. The Company does not warrant that the website
        will be uninterrupted, timely, secure, or error-free.
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        <strong>13.1</strong> Nothing in these Terms limits or excludes liability that cannot lawfully
        be limited or excluded, including liability for death or personal injury caused by negligence,
        or for fraud.
      </p>
      <p>
        <strong>13.2</strong> Subject to clause 13.1, the Company shall not be liable, whether in
        contract, tort (including negligence), breach of statutory duty, or otherwise, for any: (a)
        loss of profit; (b) loss of business, revenue, or anticipated savings; (c) loss or corruption
        of data; or (d) indirect, special, or consequential loss.
      </p>
      <p>
        <strong>13.3</strong> Subject to clauses 13.1 and 13.2, the Company&rsquo;s total aggregate
        liability arising out of or in connection with an engagement shall not exceed the total fees
        paid by the Client under that engagement in the twelve (12) months preceding the event giving
        rise to the claim.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        <strong>14.1</strong> The Client shall indemnify and hold the Company harmless against all
        liabilities, costs, and expenses arising from the Client&rsquo;s breach of the Agreement, its
        misuse of the Deliverables, or any claim that materials supplied by the Client infringe the
        rights of a third party.
      </p>

      <h2>15. Term and termination</h2>
      <p>
        <strong>15.1</strong> Either party may terminate an engagement by written notice if the other
        party: (a) commits a material breach that is not remedied within fourteen (14) days of written
        notice; or (b) becomes insolvent, enters liquidation, or is unable to pay its debts.
      </p>
      <p>
        <strong>15.2</strong> The Client may terminate an engagement for convenience on thirty (30)
        days&rsquo; written notice, in which case the Client shall pay for all Services performed and
        costs committed up to the effective date of termination.
      </p>

      <h2>16. Consequences of termination</h2>
      <p>
        <strong>16.1</strong> On termination, all sums due to the Company become immediately payable,
        each party shall return or destroy the other&rsquo;s confidential information, and any
        licences granted terminate save for those relating to fully paid Deliverables. Clauses which
        by their nature should survive termination shall do so.
      </p>

      <h2>17. Force majeure</h2>
      <p>
        <strong>17.1</strong> Neither party shall be liable for any failure or delay in performance
        caused by events beyond its reasonable control, including acts of God, war, civil unrest,
        epidemic, failure of utilities or telecommunications, or governmental action. The affected
        party shall notify the other and use reasonable efforts to mitigate the effect.
      </p>

      <h2>18. Non-solicitation</h2>
      <p>
        <strong>18.1</strong> During an engagement and for twelve (12) months thereafter, neither
        party shall solicit or employ any personnel of the other who were directly involved in the
        engagement, without the other party&rsquo;s prior written consent.
      </p>

      <h2>19. Notices</h2>
      <p>
        <strong>19.1</strong> Notices under the Agreement shall be in writing and delivered by hand,
        by prepaid registered post, or by email to the addresses notified by the parties. Notices by
        email are deemed received on the next business day.
      </p>

      <h2>20. Dispute resolution</h2>
      <p>
        <strong>20.1</strong> The parties shall first attempt to resolve any dispute amicably through
        good-faith negotiation. If the dispute is not resolved within thirty (30) days, it shall be
        referred to and finally resolved by arbitration by a single arbitrator under the Arbitration
        Act, No. 4 of 1995 (as amended), with the seat of arbitration in Mombasa, Kenya, and the
        proceedings conducted in the English language.
      </p>

      <h2>21. Governing law and jurisdiction</h2>
      <p>
        <strong>21.1</strong> The Agreement and any dispute arising out of or in connection with it
        are governed by and construed in accordance with the laws of the Republic of Kenya, and
        subject to clause 20, the courts of Kenya shall have exclusive jurisdiction.
      </p>

      <h2>22. General provisions</h2>
      <p>
        <strong>22.1 Entire agreement.</strong> The Agreement constitutes the entire agreement between
        the parties and supersedes all prior discussions and representations.
      </p>
      <p>
        <strong>22.2 Severability.</strong> If any provision is held invalid or unenforceable, the
        remaining provisions continue in full force and effect.
      </p>
      <p>
        <strong>22.3 Waiver.</strong> No failure or delay in exercising a right constitutes a waiver
        of that right.
      </p>
      <p>
        <strong>22.4 Assignment.</strong> The Client may not assign the Agreement without the
        Company&rsquo;s prior written consent.
      </p>
      <p>
        <strong>22.5 No partnership.</strong> Nothing in the Agreement creates a partnership, joint
        venture, or employment relationship between the parties.
      </p>

      <h2>23. Contact us</h2>
      <p>
        Questions about these Terms may be sent to {company.legalName},{" "}
        {company.addressLine}, or by email to{" "}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    </LegalLayout>
  );
}
