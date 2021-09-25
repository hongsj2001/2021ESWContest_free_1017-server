const firebase = require('firebase');
//파이어베이스 정보
const firebaseConfig = {
  apiKey: "AIzaSyBPo1pxsWb00QXBltqvnxh2esvxvChgUF8",
  authDomain: "embededsoftware-7f52e.firebaseapp.com",
  databaseURL: "https://embededsoftware-7f52e-default-rtdb.firebaseio.com",
  projectId: "embededsoftware-7f52e",
  storageBucket: "embededsoftware-7f52e.appspot.com",
  messagingSenderId: "187489224445",
  appId: "1:187489224445:web:c27c092d0e3fd30ccaa094",
  measurementId: "G-E4KE4CPD50"
};


firebase.initializeApp(firebaseConfig);
//푸시알림 정보
const request = require('request');
const options = {
    uri:'https://fcm.googleapis.com/fcm/send', 
    method: 'POST',
    headers: {
        "content-type": "application/json",
        "Authorization": "key= AAAAK6c6hv0:APA91bHyWnxbMVczMy8W4YwrkIaMiW642XDRqQvyPWHxe4VG3YQasj7Z1M9H7acFncbqNgKKeH89xtaTo9nNNAiEnXYWbn7-XvPbpy8FBRTfd-1r_z6rMIzXAyoo7EvCbsUkF5zmEuQx"
    },
    json: {
        'to':'',
        'notification': {
           'title': '',
           'body': ''
           
        }
    }
  }

  var token = [];
  var keyval = [];

  //파이어베이스에 등록된 토큰 값들을 받아서 저장
  firebase.database().ref("Token").on('value', (snapshot)=>{
    val = snapshot.val();
    console.log(val);
    //키값들을 받는다.
    keyval = Object.keys(val);
    // 토큰값을 받는다.
    token = Object.values(val);
    
    console.log(key);
    console.log(token);
  })

//초기 택배 정보
var Package ={
    arriveday : '',
    arrivetime: '',
    receiveday:'',
    receivetime:'',
    objectId:'',
    receive:'미수령',
    checkday:'',
    checktime: ''
}

var key=[];

//data에 택배 정보가 변경될때마다 key에 저장
firebase.database().ref("data").on('value', (snapshot)=>{
  if(!snapshot.val()){
  }
  else{
    keydata = snapshot.val();
    key = Object.keys(keydata);
    console.log(key);
  }
})


//새로운 택배가 도착했을 때마다(count가 올라갈 때) data에 택배 정보를 저장 후 푸시알림
firebase.database().ref("/count").on('value', (snapshot)=>{
      count = snapshot.val();
      if(count == 0){
      }
      else{
        Package.objectId = firebase.database().ref('/data').push().key;
        Package.arriveday = getDate();
        Package.arrivetime = getTime();
        firebase.database().ref(`/data/${Package.objectId}`).set(Package);

        options.json.notification.title = "Delivery Service"
        options.json.notification.body = "새로운 택배가 도착했습니다!"
        token.forEach(function(element){
          options.json.to = element;
          request.post(options, function(err,httpResponse,body){ /* ... */ });
        })
      }
})
//getPackage를 통해 정상 수령인지 도난이 의심되는 상황인지 판단
firebase.database().ref("/getPackage").on('value', (snapshot)=>{
  packageData = snapshot.val();
  firebase.database().ref("/count").once('value',(data)=>{
    countData = data.val();
    console.log(countData);
    listlen = key.length;
    console.log(listlen);
    for (i = listlen-countData; i<listlen; i++){
      console.log(i);
      keyval=key[i];
      console.log(keyval);
      daypath = `/data/${keyval}/receiveday`;
      timepath = `/data/${keyval}/receivetime`;
      if(packageData == "GoodTake"){          //정상 수령인 경우 수령 시간을 저장
          DateStr = getDate();
          TimeStr = getTime();
          firebase.database().ref(daypath).set(DateStr);
          firebase.database().ref(timepath).set(TimeStr);
          firebase.database().ref(`/data/${keyval}/receive`).set('수령완료')
        }
      if(packageData == "SuspectedTheft"){    //도난 의심인 경우 도난 시간을 저장 후 푸시알림
        DateStr = getDate();
        TimeStr =getTime();
        firebase.database().ref(daypath).set(DateStr);
        firebase.database().ref(timepath).set(TimeStr);
        firebase.database().ref(`/data/${keyval}/receive`).set('도난 의심');

        options.json.notification.title = "Delivery Service"
        options.json.notification.body = "택배 도난이 의심됩니다!"
        token.forEach(function(element){
          options.json.to = element;
          request.post(options, function(err,httpResponse,body){ /* ... */ });
        })
      }
    }
  })
  firebase.database().ref('/getPackage').set('');     //값 초기화
  firebase.database().ref('/count').set(0);
})

//시간 정보 
function getTime(){
    var today = new Date();
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 
    var timeString = hours + ':' + minutes  + ':' + seconds;
    return timeString;
}
//날짜 정보
function getDate(){
    var today = new Date();
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '/' + month  + '/' + day;
    return dateString;
}