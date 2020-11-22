const ctx = document.getElementById("myChart").getContext("2d");


const createChart = (key) => {
  const labels = key.filter(k => k.length !== 0)
  return new Chart(ctx, {
    // The type of chart we want to create
    type: "bar",
    // The data for our dataset
    data: {
      labels: labels,
      datasets: [
        {
          label: "テストにチャレンジした回数",
          backgroundColor: "#17a2b8",
          borderColor: "#17a2b8",
          data: [10, 100, 50, 20, 200, 300, 450],
        },
        {
          label: "テストをクリアした回数",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: [1, 10, 5, 2, 20, 30, 45],
        },
      ],
    },

    // Configuration options go here
    options: {},
  });
};

