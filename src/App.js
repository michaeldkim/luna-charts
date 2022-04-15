import { useEffect } from 'react';
import { createChart, CrosshairMode } from "lightweight-charts";

const lunaUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=LUNA&market=USD&apikey=CT4XD7F3RMG3G1PG';

var container = document.createElement('div');
document.body.appendChild(container);

async function getData() {
  const response = await fetch(lunaUrl)
  return response.json()
}

var chart = createChart(container, {
	width: window.innerWidth,
  height: window.innerHeight - 1,
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

var smaLine = chart.addLineSeries({
	color: 'rgba(4, 111, 232, 1)',
	lineWidth: 2,
});

function App() {
  useEffect(() => {
    let timeoutId;

    function setLegendText(priceValue) {
      let val = 'n/a';
      if (priceValue !== undefined) {
        val = (Math.round(priceValue * 100) / 100).toFixed(2);
      }
      legend.innerHTML = 'MA10 <span style="color:rgba(4, 111, 232, 1)">' + val + '</span>';
    }
    
    function calculateSMA(data, count){
      var avg = function(data) {
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
           sum += data[i].close;
        }
        return sum / data.length;
      };
      var result = [];
      for (var i=count - 1, len=data.length; i < len; i++){
        var val = avg(data.slice(i - count + 1, i));
        result.push({ time: data[i].time, value: val});
      }
      return result;
    }

    async function getLatestPrice(){
      try {
        const data = await getData();
        const luna = data['Time Series (Digital Currency Daily)'];
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
            color: candleData['open'] > candleData['close'] ? "rgba(255,82,82, 0.5)" : "rgba(0, 150, 136, 0.5)",
          }
          volumes.push(volumeData);
        }
        candleSeries.setData(prices.reverse());
        volumeSeries.setData(volumes.reverse());

        var smaData = calculateSMA(prices, 10)
        smaLine.setData(smaData);

        setLegendText(smaData[smaData.length - 1].value);

        chart.subscribeCrosshairMove((param) => {
	        setLegendText(param.seriesPrices.get(smaLine));
        });
        
      } catch (error) {
        console.log(error)
      }
      timeoutId = setTimeout(getLatestPrice, 100000);
    }


    var legend = document.createElement('div');
    legend.className = 'sma-legend';
    container.appendChild(legend);
    legend.style.display = 'block';
    legend.style.left = 3 + 'px';
    legend.style.top = 3 + 'px';
    
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
