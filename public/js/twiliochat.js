function fetchAccessToken(username, handler) {
    $.post('/token', {identity: username}, null, 'json')
      .done(function(response) {
        handler(response.token);
      })
      .fail(function(error) {
        console.log('Failed to fetch the Access Token with error: ' + error);
      });
  }

  function connectMessagingClient(token) {
    // Initialize the Chat messaging client
    Twilio.Chat.Client.create(token).then(function(client) {
      tc.messagingClient = client;
      updateConnectedUI();
      tc.loadChannelList(tc.joinGeneralChannel);
      tc.messagingClient.on('channelAdded', $.throttle(tc.loadChannelList));
      tc.messagingClient.on('channelRemoved', $.throttle(tc.loadChannelList));
      tc.messagingClient.on('tokenExpired', refreshToken);
    });
  }


  tc.loadChannelList = function(handler) {
  if (tc.messagingClient === undefined) {
    console.log('Client is not initialized');
    return;
  }

  tc.messagingClient.getPublicChannelDescriptors().then(function(channels) {
    tc.channelArray = tc.sortChannelsByName(channels.items);
    $channelList.text('');
    tc.channelArray.forEach(addChannel);
    if (typeof handler === 'function') {
      handler();
    }
  });
};