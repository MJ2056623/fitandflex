export default function DashboardCard({

    title,

    value,

    subtitle

}) {

    return (

        <div className="dashboard-card">

            <h6>

                {title}

            </h6>

            <h2>

                {value}

            </h2>

            <p>

                {subtitle}

            </p>

        </div>

    );

}