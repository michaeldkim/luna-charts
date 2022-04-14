import { useEffect, useState, useMemo } from 'react';
import { createChart, CrosshairMode } from "lightweight-charts";

const lunaUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=LUNA&market=USD&apikey=CT4XD7F3RMG3G1PG';

async function getData() {
  const response = await fetch(lunaUrl)
  return response.json()
}

const directionEmojis = {
  up: '🚀',
  down: '💩',
  '': '',
};

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

function App() {
  const [price,setPrice] = useState(-1);
  const [prevPrice, setPrevPrice] = useState(-1);

  useEffect(() => {
    let timeoutId;
    async function getLatestPrice(){
      try {
        const data = await getData();
        const luna = data['Time Series (Digital Currency Daily)'];
        
        const prices = [];
        for (const property in luna) {
          var entry = {
            time: property.toString(),
            open: Number(`${luna[property]['1a. open (USD)']}`),
            high: Number(`${luna[property]['2a. high (USD)']}`),
            low: Number(`${luna[property]['3a. low (USD)']}`),
            close: Number(`${luna[property]['4a. close (USD)']}`),
          }
          prices.push(entry)
          
        }
        const rprices = [];
        for (var i = prices.length -1; i >= 0; i--){
          rprices.push(prices[i])
        }

        setPrevPrice(price);
        setPrice(prices[0]['close']);
        candleSeries.setData(rprices);

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

  const direction = useMemo(() => prevPrice < price ? 'up' : prevPrice > price ? 'down' : '', [prevPrice, price]);
  
  return (
    <div>
      
    </div>
  );
}

export default App;
