import { useEffect } from 'react';
import { createChart, CrosshairMode } from "lightweight-charts";

const lunaUrl = 'https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=LUNA&market=USD&apikey=CT4XD7F3RMG3G1PG';

var container = document.createElement('div');
container.className = 'container';
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

var smaLine7 = chart.addLineSeries({
	color: 'rgba(4, 111, 232, 1)',
	lineWidth: 2,
});

var smaLine25 = chart.addLineSeries({
	color: 'rgba(211, 4, 4, 1)',
	lineWidth: 2,
});

var smaLine99 = chart.addLineSeries({
	color: 'rgba(4, 211, 4, 1)',
	lineWidth: 2,
});

function App() {
  useEffect(() => {
    let timeoutId;

    function setLegendText(priceValue, number) {
      let val = 'n/a';
      if (priceValue !== undefined) {
        val = (Math.round(priceValue * 100) / 100).toFixed(2);
      }
      if (number === 7){
        box7.innerHTML = 'MA(' + number + '): <span style="color:rgba(4, 111, 232, 1)">' + val + '</span>';
      } 
      else if (number === 25){
        box25.innerHTML = 'MA(' + number + '): <span style="color:rgba(211, 4, 4, 1)">' + val + '</span>';
      }
      else {
        box99.innerHTML = 'MA(' + number + '): <span style="color:rgba(4, 211, 4, 1)">' + val + '</span>';
      }
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

        var smaData7 = calculateSMA(prices, 7)
        smaLine7.setData(smaData7);
        setLegendText(smaData7[smaData7.length - 1].value,7);

        var smaData25 = calculateSMA(prices, 25)
        smaLine25.setData(smaData25);
        setLegendText(smaData25[smaData25.length - 1].value, 25);

        var smaData99 = calculateSMA(prices, 99)
        smaLine99.setData(smaData99);
        setLegendText(smaData99[smaData99.length - 1].value, 99);

        chart.subscribeCrosshairMove((param) => {
	        setLegendText(param.seriesPrices.get(smaLine7), 7);
          setLegendText(param.seriesPrices.get(smaLine25), 25);
          setLegendText(param.seriesPrices.get(smaLine99), 99);
        });

      } catch (error) {
        console.log(error)
      }
      timeoutId = setTimeout(getLatestPrice, 100000);
    }
    

      var legend = document.createElement('div');
      legend.className = 'sma-legend';
      legend.id = 'sma-legend';
      container.appendChild(legend);

      var box7 = document.createElement('div');
      document.getElementById('sma-legend').appendChild(box7);
      var box25 = document.createElement('div');
      document.getElementById('sma-legend').appendChild(box25);
      var box99 = document.createElement('div');
      document.getElementById('sma-legend').appendChild(box99);
      
      getLatestPrice();

    return () => {
      clearTimeout(timeoutId);
    }
  }, []);
  
  return (
    <div className="base">
      
    </div>
  );
}

export default App;
