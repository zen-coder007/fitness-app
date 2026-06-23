import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function HistoryChart() {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/user/history", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });

        const history = res.data.history;

        const labels = history.map((item) =>
          new Date(item.date).toLocaleDateString()
        );

        const waterData = history.map((item) => item.water);
        const caloriesData = history.map((item) => item.calories);

        setChartData({
          labels,
          datasets: [
            {
              label: "Water 💧",
              data: waterData
            },
            {
              label: "Calories 🍗",
              data: caloriesData
            }
          ]
        });

      } catch (error) {
        console.log(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Progress Chart 📊</h2>
      {chartData.labels ? <Line data={chartData} /> : "Loading..."}
    </div>
  );
}

export default HistoryChart;