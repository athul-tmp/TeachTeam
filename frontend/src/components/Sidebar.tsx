import Link from "next/link";

/* Reference: Week 3 Tutorial Activity 1 */
const Sidebar = () => {
  return (
    <nav className="side-nav">
      <ul className="side-nav-list">
        <li className="side-nav-item">
            <Link className="side-nav-link" href="/lecturer">View Applicants</Link>
        </li>
        <li className="side-nav-item">
            <Link className="side-nav-link" href="/lecturerManage">Manage Selected Candidates</Link>
        </li>
        <li className="side-nav-item">
            <Link className="side-nav-link" href="/lecturerAnalytics">View Applicants Analytics</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
