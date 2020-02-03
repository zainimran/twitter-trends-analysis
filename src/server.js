var twit = require('twit');
var config = require('./config');
var T = new twit(config);
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const {timeParse} = require('d3');

var sentiments = ['positive', 'neutral', 'negative']
var commercials = ['commercial', 'non-commercial']
var adults = ['adult', 'no-adult']
var subjectives = ['subjecive', 'objective']
var educationals = ['educational', 'non-educational']
var topics = ['topic1', 'topic2', 'topic3', 'topic4', 'topic5']
var genders = ['male', 'female']
var descriptions = ['positive', 'neutral', 'negative']
var country = ['USA', 'PAK', 'IND', 'GBR', 'UAE', 'CAN', 'BRA', 'RUS', 'AUS', 'CHN']


const readFile = file =>
	new Promise((resolve, reject) =>
		fs.readFile(file, (err, data) =>
			err ? reject(err) : resolve(data)))

const twit_sentiment = text =>
	new Promise((resolve, reject) =>
		datum.twitterSentimentAnalysis(text, (err, data) =>
			err ? reject(err) : resolve(data)))

const twit_topic = text =>
	new Promise((resolve, reject) =>
		datum.topicClassification(text, (err, data) =>
			err ? reject(err) : resolve(data)))

const twit_edu = text =>
	new Promise((resolve, reject) =>
		datum.educationalDetection(text, (err, data) =>
			err ? reject(err) : resolve(data)))

// Given socket id returns the corresponding clientData object
const getClientData = (sockid) =>
{
	return clientData.filter(s => s.user === sockid)[0]
}

// Given socket id returns the corresponding socket
const getClient = (sockid) =>
{
	return clients.filter(s => s.id === sockid)[0]
}

// For a given query makes a complete JSON

const makeJSON = (result) =>
{
	let cleanData = []
    result.data['statuses'].forEach(element => {
        let st = {}
		st['Time'] = element['created_at']
		//st['text'] = element['text']
        //st['hashtags'] = element['entities']['hashtags']
		st['Language'] = element['lang']
		st['Place'] = /*element['place']*/ country[Math.floor(Math.random()*country.length)]
		st['Retweets'] = element['retweet_count']
        st['Favorites'] = element['favorite_count']
        st['Sentiment'] = sentiments[Math.floor(Math.random()*sentiments.length)]
        st['Commercial'] = commercials[Math.floor(Math.random()*commercials.length)]
        st['Adult'] = adults[Math.floor(Math.random()*adults.length)]
        st['Subjective'] = subjectives[Math.floor(Math.random()*subjectives.length)]
        st['Educational'] = educationals[Math.floor(Math.random()*educationals.length)]
        st['Topic'] = topics[Math.floor(Math.random()*topics.length)]
        st['Gender'] = genders[Math.floor(Math.random()*genders.length)]
        st['Username'] = element['user']['screen_name']
        st['User Type'] = descriptions[Math.floor(Math.random()*descriptions.length)]
        st['User Followers Count'] = element['user']['followers_count']
        st['User Friends Count'] = element['user']['friends_count']
        st['User Favourites Count'] = element['user']['favourites_count']
        st['User Statuses Count'] = element['user']['statuses_count']
        cleanData = [...cleanData, st]
    });
	cleanData = {'data': cleanData}
	return cleanData
}

const server = http.createServer(async (request, response) =>
{
	try
	{
		response.end(await readFile(request.url.substr(1)))
	}
	catch(err)
	{
		response.end()
	}
})

const io = socketio(server)
clients = []
clientData = []
io.sockets.on('connection', socket =>
{
	// SET UP STATE
	clients = [...clients, socket]
	cData =
	{
		user: socket.id,
		query: "",
		data: {},
		views: {}
	}
	clientData = [...clientData, cData]

	// GET QUERY FROM CLIENT
	socket.on('to_server', data =>
	{
		sender = socket.id
		cData = getClientData(sender)
		cData.query = data
		T.get('search/tweets', {q: data, count: 100, result_type: "recent"})
			.catch((err) => {
				throw String.format('caught error {0}', err.stack)
			})
			.then((result) => {
				cleanData = makeJSON(result);
				socket.emit('to_client', cleanData);
			})
	})

	socket.on('disconnect', () =>
	{
		dis = socket.id
		clients = clients.filter(s => s !== socket)
		cData = getClientData(dis)
		clientData = clientData.filter(g => g !== cData)
	})
})

server.listen(8000)