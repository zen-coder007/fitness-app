import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const API = "https://fitness-backend-94sx.onrender.com";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState(0);
  const [history, setHistory] = useState([]);
  const [plan, setPlan] = useState(null);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadAll();
    }
  }, []);

  const tokenHeader = () => ({
    Authorization: "Bearer " + localStorage.getItem("token")
  });

  const loadAll = () => {
    getProfile();
    getDashboard();
    getHistory();
  };

  // 🔐 LOGIN
  const handleLogin = async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      loadAll();
    } else {
      alert(data.message);
    }
  };

  // 🔓 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // 👤 PROFILE + PLAN (🔥 FIXED)
  const getProfile = async () => {
    const res = await fetch(`${API}/api/user/profile`, {
      headers: tokenHeader()
    });

    const data = await res.json();
    const u = data.user || data;

    setUser(u);

    // 🔥 IF DATA MISSING → FORM
    if (!u.weight || !u.height || u.weight === 0 || u.height === 0) {
      setShowForm(true);
      return;
    }

    // 🔥 AUTO BMI
    const bmi = u.weight / ((u.height / 100) * (u.height / 100));

    let autoGoal = "maintain";
    if (bmi < 18.5) autoGoal = "weight gain";
    else if (bmi > 25) autoGoal = "weight loss";

    // 🔥 PLAN CALL
    const planRes = await fetch(`${API}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: autoGoal,
        weight: Number(u.weight),
        height: Number(u.height)
      })
    });

    const planData = await planRes.json();

    setPlan({
      ...planData,
      bmi: bmi.toFixed(1),
      goal: autoGoal
    });
  };

  // 🔥 SAVE DETAILS (FIXED)
  const saveDetails = async () => {
    await fetch(`${API}/api/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...tokenHeader()
      },
      body: JSON.stringify({
        weight: Number(user.weight),
        height: Number(user.height),
        age: Number(user.age),
        goal: user.goal
      })
    });

    setShowForm(false);
    loadAll();
  };

  // 📊 DASHBOARD
  const getDashboard = async () => {
    const res = await fetch(`${API}/api/user/dashboard`, {
      headers: tokenHeader()
    });
    const data = await res.json();
    setWater(data.water || 0);
    setCalories(data.calories || 0);
  };

  // 📜 HISTORY
  const getHistory = async () => {
    const res = await fetch(`${API}/api/user/history`, {
      headers: tokenHeader()
    });
    const data = await res.json();
    setHistory(data.history || []);
  };

  // 💧 WATER
  const addWater = async () => {
    const res = await fetch(`${API}/api/user/water`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...tokenHeader() },
      body: JSON.stringify({ amount: 0.5 })
    });
    const data = await res.json();
    setWater(data.totalWater);
  };

  // 🍗 CALORIES
  const addCalories = async () => {
    const res = await fetch(`${API}/api/user/calories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...tokenHeader() },
      body: JSON.stringify({ amount: 100 })
    });
    const data = await res.json();
    setCalories(data.totalCalories);
  };

  // 🔄 SAVE DAY
  const saveDay = async () => {
    await fetch(`${API}/api/user/reset`, {
      method: "POST",
      headers: tokenHeader()
    });
    loadAll();
    alert("Day Saved ✅");
  };

  const chartData = {
    labels: history.map(h =>
      new Date(h.createdAt).toLocaleDateString()
    ),
    datasets: [
      { label: "Water", data: history.map(h => h.water) },
      { label: "Calories", data: history.map(h => h.calories) }
    ]
  };

  // 🔐 LOGIN UI
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Login</h2>
          <input style={styles.input} placeholder="Email" onChange={e=>setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
          <button style={styles.button} onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  // 🔥 FORM UI
  if (showForm) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Enter Fitness Details</h2>

          <input placeholder="Weight" style={styles.input}
            onChange={(e)=>setUser({...user, weight:e.target.value})} />

          <input placeholder="Height" style={styles.input}
            onChange={(e)=>setUser({...user, height:e.target.value})} />

          <input placeholder="Age" style={styles.input}
            onChange={(e)=>setUser({...user, age:e.target.value})} />

          <button style={styles.button} onClick={saveDetails}>
            Save Details
          </button>
        </div>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>

        <div style={styles.header}>
          <h2>Fitness Dashboard</h2>
          <button style={styles.logout} onClick={handleLogout}>Logout</button>
        </div>

        {user && (
          <div style={styles.card}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>Streak: {user.streak}</p>
          </div>
        )}

        {plan && plan.diet && (
          <div style={styles.card}>
            <h2>BMI: {plan.bmi}</h2>
            <h3>Calories: {plan.calories}</h3>
            <h3>Water Target: {plan.waterTarget} L</h3>

            <h3>Diet</h3>
            <ul>{plan.diet.map((d,i)=><li key={i}>{d}</li>)}</ul>

            <h3>Workout</h3>
            <ul>{plan.workout.map((d,i)=><li key={i}>{d}</li>)}</ul>
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Water</h3>
            <h2>{water} L</h2>
            <button style={styles.smallBtn} onClick={addWater}>+0.5</button>
          </div>

          <div style={styles.card}>
            <h3>Calories</h3>
            <h2>{calories}</h2>
            <button style={styles.smallBtn} onClick={addCalories}>+100</button>
          </div>
        </div>

        <div style={styles.card}>
          <button style={styles.button} onClick={saveDay}>
            Save Day
          </button>
        </div>

        <div style={styles.card}>
          <h3>Progress</h3>
          {history.length > 0 ? <Line data={chartData} /> : <p>No data</p>}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { background:"#0f172a", minHeight:"100vh", padding:"20px", color:"white"},
  dashboard: { maxWidth:"900px", margin:"auto"},
  header: { display:"flex", justifyContent:"space-between"},
  grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px"},
  card: { background:"#1e293b", padding:"20px", borderRadius:"10px", marginTop:"15px"},
  input: { width:"90%", padding:"10px", margin:"8px"},
  button: { padding:"10px", background:"#22c55e", color:"white", border:"none", borderRadius:"5px"},
  smallBtn: { marginTop:"10px", padding:"6px", background:"#3b82f6", color:"white", border:"none", borderRadius:"5px"},
  logout: { background:"red", color:"white", border:"none", padding:"6px 12px", borderRadius:"5px"}
};

export default App;