import Vue from 'vue'
import App from './App'

require('src/styles.scss')

const colorDefaultBlockPrimary = '#e5e5e5';
const colorDefaultBlockBG = 'white';
const colors = [
  '#5bc0eb',
  '#fde74c',
  '#9bc53d',
  '#e55934',
  '#fa7921'
]

var moment = require('moment');

var data = {
  moment: moment,
  blocks: new Array(144),
  activities: [
    {
      name: 'No Plans',
      style: {backgroundColor: colorDefaultBlockPrimary},
      selected: true
    },
    {
      name: 'Sleep',
      style: {backgroundColor: '#333333', color: 'white'},
      selected: false
    },
    {
      name: 'Exercise',
      style: {backgroundColor: colors[0]},
      selected: false
    },
    {
      name: 'Work',
      style: {backgroundColor: colors[1]},
      selected: false
    },
    {
      name: 'Fun',
      style: {backgroundColor: colors[2]},
      selected: false
    }
  ]
}

window.data = data;

var selectedActivity = data.activities[0];

var saveLoadFields = ['saveTime', 'blocks', 'activities']

function save() {
  data.saveTime = moment()
  for (var i = saveLoadFields.length - 1; i >= 0; i--) {
    localStorage.setItem('1000minutes|' + saveLoadFields[i], JSON.stringify(data[saveLoadFields[i]]))
  }
}

function load() {
  for (var i = saveLoadFields.length - 1; i >= 0; i--) {
    let loadedData = localStorage.getItem('1000minutes|' + saveLoadFields[i])
    if (loadedData && loadedData.length && loadedData.length > 0) {
      data[saveLoadFields[i]] = JSON.parse(loadedData);
    }
  }
}

function isBlockNow(i) {
  let blockStart = moment().startOf('day').add(i*10, 'minutes');
  let blockEnd = moment().startOf('day').add((i+1)*10, 'minutes');
  let now = moment();
  return (blockStart < now && now < blockEnd);
};

function updateNowBlock() {
  var newBlocks = [].concat(data.blocks)
  var time = moment().startOf('day');
  var nowIndex;
  for (var i = 0; i < newBlocks.length; i++) {
    newBlocks[i].isNow = isBlockNow(i)
    if (newBlocks[i].isNow)
      nowIndex = i;
    time.add(10, 'minutes');
  }
  data.blocks = newBlocks;
  let then = moment().startOf('day').add((nowIndex+1)*10, 'minutes');
  let now = moment();
  setTimeout(updateNowBlock, then - now);
}

function initBlocks() {
  var newBlocks = new Array(144);
  var time = moment().startOf('day');
  for (var i = 0; i < newBlocks.length; i++) {
    newBlocks[i] = {
      blockStyle: {backgroundColor: colorDefaultBlockPrimary},
      bgStyle: {backgroundColor: colorDefaultBlockBG},
      time: time.format('h:mm'),
      time2: time.format('a'),
    };
    time.add(10, 'minutes');
  }
  data.blocks = newBlocks;
}

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

var selecting = false;
var selectStart = 0;
var selectEnd = 0;

function updateSelection() {
  var low, high;
  if (selectStart < selectEnd) {
    low = selectStart;
    high = selectEnd;
  } else {
    low = selectEnd;
    high = selectStart;
  }
  var newBlocks = [].concat(data.blocks);
  for (var i = 0; i < newBlocks.length; i++) {
    if (low <= i && i <= high) {
      newBlocks[i].bgStyle = selectedActivity.style;
    } else {
      newBlocks[i].bgStyle = {backgroundColor: colorDefaultBlockBG};
    }
  }
  data.blocks = newBlocks;

}

function manipulateSelection() {
 var low, high;
  if (selectStart < selectEnd) {
    low = selectStart;
    high = selectEnd;
  } else {
    low = selectEnd;
    high = selectStart;
  }
  var newBlocks = [].concat(data.blocks);
  for (var i = 0; i < newBlocks.length; i++) {
    newBlocks[i].bgStyle = {backgroundColor: colorDefaultBlockBG};
    if (low <= i && i <= high) {
      newBlocks[i].blockStyle = selectedActivity.style;
    } else {

    }
  }
  data.blocks = newBlocks;
  save()
}

initBlocks()
updateNowBlock()
load()
var dayGrid = new Vue({
  el: '#day-grid',
  data: data,
  methods: {
    startSelection(i) {
      window.ontouchmove = preventDefault;
      selecting = true;
      selectStart = i;
      selectEnd = i;
      updateSelection()
    },
    updateSelection(i) {
      if (!selecting) return;
      selectEnd = i;
      updateSelection()
    },
    endSelection(i) {
      selecting = false;
      selectEnd = i;
      window.ontouchmove = null;
      updateSelection()
      manipulateSelection()
    },
    onTouchMove(e) {
      if (!selecting) return;
      let touch = e.touches[0]
      let x = touch.clientX
      let y = touch.clientY
      let el = document.elementFromPoint(x, y);
      if (el) {
        let index = el.getAttribute('data-index')
        if (index && selectEnd != index) {
          selectEnd = index;
          updateSelection()
        }
      }
    },
    onTouchEnd(e) {
      selecting = false;
      window.ontouchmove = null;
      updateSelection()
      manipulateSelection()
    }
  }
})

var activitySelectBar = new Vue({
  el: '#activity-select-bar',
  data: {activities: data.activities},
  methods: {
    select(activity) {
      selectedActivity.selected = false;
      activity.selected = true;
      selectedActivity = activity;
      let newActivities = [].concat(data.activities);
      data.activities = newActivities;
    }
  }
});


setTimeout(() => {
  var loadingCover = document.getElementById('loading-cover');
  loadingCover.className = '';
  setTimeout(() => {
    document.getElementById('loading-cover').remove()
  }, 1000)
}, 0)
