import { useEffect } from 'react';
import { createChart, CrosshairMode } from "lightweight-charts";

const lunaUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=LUNA&market=USD&apikey=CT4XD7F3RMG3G1PG';

async function getData() {
  const response = await fetch(lunaUrl)
  return response.json()
}

var chart = createChart(document.body, {
	width: window.innerWidth,
  height: window.innerHeight,
	layout: {
		backgroundColor: '#253248',
		textColor: 'rgba(255, 255, 255, 0.9)',
	},
	grid: {
		vertLines: {
			color: '#334158',
		},
		horzLines: {
			color: '#334158',
		},
	},
	crosshair: {
		mode: CrosshairMode.Normal,
	},
	rightPriceScale: {
		borderColor: '#485c7b',
	},
	timeScale: {
		borderColor: '#485158',
	},
  watermark: {
    text: "Terra (LUNA)",
    fontSize: 256,
    color: "rgba(256, 256, 256, 0.1)",
    visible: true
  }
});

var candleSeries = chart.addCandlestickSeries({
  upColor: "#4bffb5",
  downColor: "#ff4976",
  borderDownColor: "#ff4976",
  borderUpColor: "#4bffb5",
  wickDownColor: "#838ca1",
  wickUpColor: "#838ca1"
});

var volumeSeries = chart.addHistogramSeries({
	color: '#26a69a',
	priceFormat: {
		type: 'volume',
	},
	priceScaleId: '',
	scaleMargins: {
		top: 0.8,
		bottom: 0,
	},
});

function App() {

  useEffect(() => {
    let timeoutId;
    async function getLatestPrice(){
      try {
        const data = await getData();
        const luna = data['Time Series (Digital Currency Daily)'];
        //console.log(luna)
        const prices = [];
        const volumes = [];
        for (const property in luna) {
          var candleData = {
            time: property.toString(),
            open: Number(`${luna[property]['1a. open (USD)']}`),
            high: Number(`${luna[property]['2a. high (USD)']}`),
            low: Number(`${luna[property]['3a. low (USD)']}`),
            close: Number(`${luna[property]['4a. close (USD)']}`),
          }
          prices.push(candleData);

          var volumeData = {
            time: property.toString(),
            value: Number(`${luna[property]['5. volume']}`),
            color: candleData['open'] < candleData['close'] ? "red" : "green",
          }
          volumes.push(volumeData);
          
        }
        candleSeries.setData(prices.reverse());
        volumeSeries.setData(volumes.reverse());

      } catch (error) {
        console.log(error)
      }
      timeoutId = setTimeout(getLatestPrice, 100000);
    }

    getLatestPrice();

    return () => {
      clearTimeout(timeoutId);
    }
  }, []);
  
  return (
    <div>
      
    </div>
  );
}

export default App;
