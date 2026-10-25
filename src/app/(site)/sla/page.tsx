import type { Metadata } from "next";
import { LegalLayout } from "@/components/site/LegalLayout";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Service Level Agreement",
  description:
    "The Service Level Agreement (SLA) governing availability, support response times, service credits, and maintenance for services provided by Upeo Africa Technologies Ltd.",
};

export default function SLAPage() {
  return (
    <LegalLayout
      title="Service Level Agreement"
      intro="If your plan includes hosting, support, or maintenance, this is the standard of service you can hold us to: the uptime we commit to, how quickly we respond when something breaks, and the credits you are owed if we miss."
      effective="1 September 2026"
      updated="23 August 2026"
      activeHref="/sla"
    >
      <p className="lead">
        This Service Level Agreement (&ldquo;SLA&rdquo;) is entered into between{" "}
        {company.legalName}, a limited liability company incorporated in the Republic of Kenya
        of {company.addressLine} (the &ldquo;Company&rdquo;), and the client identified in the
        applicable Proposal or Statement of Work (the &ldquo;Client&rdquo;). This SLA forms part
        of, and is subject to, the Company&rsquo;s <a href="/terms">Terms of Service</a> and the
        relevant engagement. It applies to hosting, support, and maintenance services expressly
        stated to be covered by this SLA (the &ldquo;Supported Services&rdquo;).
      </p>

      <h2>1. Purpose and scope</h2>
      <p>
        <strong>1.1</strong> This SLA sets out the service levels the Company commits to in
        respect of the Supported Services, the remedies available to the Client where those
        levels are not met, and the responsibilities of each party.
      </p>
      <p>
        <strong>1.2</strong> This SLA applies only to Supported Services under an active,
        paid-up support or maintenance plan. It does not apply to one-off project deliverables
        that are not subject to a support plan.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li>
          <strong>&ldquo;Availability&rdquo;</strong> means the percentage of time in a calendar
          month during which the Supported Services are available, excluding Excused Downtime.
        </li>
        <li>
          <strong>&ldquo;Excused Downtime&rdquo;</strong> means downtime arising from Scheduled
          Maintenance, Emergency Maintenance, force majeure, the Client&rsquo;s acts or omissions,
          or third-party services outside the Company&rsquo;s reasonable control.
        </li>
        <li>
          <strong>&ldquo;Incident&rdquo;</strong> means an unplanned interruption to, or reduction
          in the quality of, a Supported Service.
        </li>
        <li>
          <strong>&ldquo;Response Time&rdquo;</strong> means the time between the Company&rsquo;s
          receipt of a properly logged Incident and its acknowledgement to the Client.
        </li>
        <li>
          <strong>&ldquo;Resolution Time&rdquo;</strong> means the time between acknowledgement and
          the restoration of the Supported Service or provision of a reasonable workaround.
        </li>
        <li>
          <strong>&ldquo;Support Hours&rdquo;</strong> means 08:00 to 17:00 East Africa Time,
          Monday to Friday, excluding public holidays in Kenya.
        </li>
      </ul>

      <h2>3. Service availability commitment</h2>
      <p>
        <strong>3.1</strong> The Company shall use commercially reasonable efforts to achieve the
        monthly Availability set out below for the applicable support plan:
      </p>
      <table>
        <thead>
          <tr>
            <th>Support plan</th>
            <th>Monthly availability target</th>
            <th>Maximum monthly downtime (approx.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Standard</td>
            <td>99.5%</td>
            <td>3 hours 39 minutes</td>
          </tr>
          <tr>
            <td>Business</td>
            <td>99.9%</td>
            <td>43 minutes</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>99.95%</td>
            <td>21 minutes</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>3.2</strong> Availability is calculated as: ((Total minutes in the month &minus;
        Excused Downtime &minus; Unavailable minutes) &divide; (Total minutes in the month &minus;
        Excused Downtime)) &times; 100.
      </p>

      <h2>4. Support hours and channels</h2>
      <p>
        <strong>4.1</strong> The Client may log Incidents by email to{" "}
        <a href={`mailto:${company.email}`}>{company.email}</a> and through any dedicated support
        channel notified by the Company. Incidents logged outside Support Hours are deemed received
        at the start of the next business day, save for Priority 1 Incidents under a Business or
        Enterprise plan, which are monitored on an extended basis where stated in the Proposal.
      </p>

      <h2>5. Incident classification</h2>
      <p>
        <strong>5.1</strong> The Company shall classify each Incident by severity as follows:
      </p>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>P1 &mdash; Critical</td>
            <td>The Supported Service is wholly unavailable or a critical function is inoperable, with no workaround, materially affecting the Client&rsquo;s business.</td>
          </tr>
          <tr>
            <td>P2 &mdash; High</td>
            <td>A major function is significantly impaired, or performance is severely degraded, but limited operation is possible.</td>
          </tr>
          <tr>
            <td>P3 &mdash; Medium</td>
            <td>A minor function is impaired, or an issue affects a limited number of users, with a workaround available.</td>
          </tr>
          <tr>
            <td>P4 &mdash; Low</td>
            <td>A cosmetic issue, question, or change request with no material impact on operations.</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Response and resolution targets</h2>
      <p>
        <strong>6.1</strong> The Company shall use commercially reasonable efforts to meet the
        following targets, measured during Support Hours unless otherwise agreed:
      </p>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Target response time</th>
            <th>Target resolution / workaround</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>P1 &mdash; Critical</td>
            <td>1 hour</td>
            <td>4 Support Hours</td>
          </tr>
          <tr>
            <td>P2 &mdash; High</td>
            <td>4 Support Hours</td>
            <td>1 business day</td>
          </tr>
          <tr>
            <td>P3 &mdash; Medium</td>
            <td>1 business day</td>
            <td>3 business days</td>
          </tr>
          <tr>
            <td>P4 &mdash; Low</td>
            <td>2 business days</td>
            <td>As scheduled</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>6.2</strong> Resolution Times are targets and not guarantees, as the time required
        depends on the nature of the Incident. The Company shall keep the Client reasonably informed
        of progress on P1 and P2 Incidents.
      </p>

      <h2>7. Scheduled and emergency maintenance</h2>
      <p>
        <strong>7.1</strong> The Company may carry out Scheduled Maintenance, for which it shall give
        the Client at least forty-eight (48) hours&rsquo; notice and which it shall endeavour to
        perform outside Support Hours.
      </p>
      <p>
        <strong>7.2</strong> The Company may carry out Emergency Maintenance without prior notice
        where necessary to preserve the security or integrity of the Supported Services, and shall
        notify the Client as soon as reasonably practicable.
      </p>

      <h2>8. Backups, recovery, and continuity</h2>
      <p>
        <strong>8.1</strong> For Supported Services that include hosting, the Company shall maintain
        regular backups with a Recovery Point Objective (RPO) of twenty-four (24) hours and a
        Recovery Time Objective (RTO) of eight (8) Support Hours, unless otherwise stated in the
        Proposal.
      </p>

      <h2>9. Security</h2>
      <p>
        <strong>9.1</strong> The Company shall apply reasonable technical and organisational measures
        to protect the Supported Services, including access controls, patching, and monitoring, and
        shall handle personal data in accordance with its <a href="/privacy">Privacy Policy</a> and
        the Data Protection Act, No. 24 of 2019.
      </p>

      <h2>10. Service credits</h2>
      <p>
        <strong>10.1</strong> Where the Company fails to meet the monthly Availability target for a
        Supported Service, the Client&rsquo;s sole and exclusive remedy is a service credit
        calculated as a percentage of the monthly support fee for the affected service, as follows:
      </p>
      <table>
        <thead>
          <tr>
            <th>Availability achieved</th>
            <th>Service credit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Below target but at or above 99.0%</td>
            <td>5% of monthly support fee</td>
          </tr>
          <tr>
            <td>Below 99.0% but at or above 98.0%</td>
            <td>10% of monthly support fee</td>
          </tr>
          <tr>
            <td>Below 98.0%</td>
            <td>20% of monthly support fee</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>10.2</strong> To claim a service credit, the Client must submit a written request
        within thirty (30) days of the end of the affected month. Service credits are applied against
        future invoices, are not redeemable for cash, and shall not exceed twenty per cent (20%) of
        the monthly support fee in any month.
      </p>

      <h2>11. Exclusions</h2>
      <p>
        <strong>11.1</strong> The service levels in this SLA do not apply to, and no service credit is
        payable for, any unavailability or Incident caused by: (a) Excused Downtime; (b) the
        Client&rsquo;s misuse, unauthorised modification, or breach of the Agreement; (c) third-party
        software, hardware, networks, or services not provided by the Company; (d) factors outside the
        Company&rsquo;s reasonable control; or (e) the Client&rsquo;s failure to implement a reasonable
        fix or update recommended by the Company.
      </p>

      <h2>12. Client responsibilities</h2>
      <p>
        <strong>12.1</strong> The Client shall: (a) report Incidents promptly with sufficient detail to
        reproduce them; (b) provide timely access, information, and approvals; (c) designate an
        authorised contact for support matters; and (d) keep its own credentials secure.
      </p>

      <h2>13. Escalation</h2>
      <p>
        <strong>13.1</strong> Where an Incident is not progressing within the target times, the Client
        may escalate it by written notice to the Company&rsquo;s support lead, and thereafter to the
        Company&rsquo;s management, using the contact details notified in the Proposal.
      </p>

      <h2>14. Review and amendment</h2>
      <p>
        <strong>14.1</strong> The parties may review this SLA annually. The Company may amend this SLA
        on thirty (30) days&rsquo; written notice, provided that no amendment shall materially reduce
        the service levels during the then-current term of a paid support plan without the
        Client&rsquo;s consent.
      </p>

      <h2>15. Term, governing law, and general</h2>
      <p>
        <strong>15.1</strong> This SLA remains in force for the duration of the applicable support or
        maintenance plan. It is governed by the laws of the Republic of Kenya and is subject to the
        dispute resolution and general provisions of the <a href="/terms">Terms of Service</a>.
      </p>

      <h2>16. Execution</h2>
      <p>
        This SLA is agreed and executed by the duly authorised representatives of the parties as of the
        effective date stated above.
      </p>
      <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {[`For and on behalf of ${company.legalName}`, "For and on behalf of the Client"].map(
          (who) => (
            <div key={who} className="border border-line p-5">
              <p className="text-sm font-semibold text-ink-900">{who}</p>
              <dl className="mt-5 space-y-5 text-sm">
                {["Name", "Title", "Signature", "Date"].map((f) => (
                  <div key={f}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      {f}
                    </dt>
                    <dd className="mt-3 h-5 border-b border-dashed border-ink-900/30" />
                  </div>
                ))}
              </dl>
            </div>
          ),
        )}
      </div>
    </LegalLayout>
  );
}
