const ITEM_REGEX = /[a-zA-Z0-9]+\.(png|jpe?g|gifv?)/;

addEventListener('fetch', event => {
  const method = event.request.method;

  if (method !== 'GET') {
    event.respondWith(new Response('', {
      status: 204,
    }));
    return;
  }

  event.respondWith(handleRequest(event));
})

/**
 * Respond to the request
 * @param {FetchEvent} event
 */
async function handleRequest (event) {
  const request = event.request;
  const url = new URL(request.url);
  const path = url.pathname.substring(1);

  if (!path) {
    return jsonError('Missing input', 406);
  }

  if (!ITEM_REGEX.test(path)) {
    return jsonError('Not found', 404);
  }

  return fetchImgurImage(path, event);
}

/**
 * Fetch an image with the id
 * @param {String} imageId
 * @param {FetchEvent} event
 * @return Response
 */
async function fetchImgurImage(imageId, event) {
  const lookUpUrl = getImageFetchUrl(imageId);
  const cache = caches.default;
  // const request = event.request;
  // let response = await cache.match(request);
  let response = await cache.match(lookUpUrl);

  if (!response) {
    const imageResponse = await fetch(lookUpUrl, {
      headers: {
        'User-Agent': process.env.USER_AGENT,
      }
    });

    const headers = {
      'cache-control': 'public, max-age=14400', // 4 hours in seconds
    };
    const cloned = imageResponse.clone();

    response = new Response(cloned.body, { ...cloned, headers });

    // only cache 200 responses
    if (imageResponse.status === 200) {
      // event.waitUntil(cache.put(request, imageResponse.clone()));
      event.waitUntil(cache.put(lookUpUrl, imageResponse.clone()));
    }
  }

  return response;
}

/**
 * Fetch an image with the id
 * @param {String} imageId
 * @return String
 */
function getImageFetchUrl(imageId) {
  return process.env.PHOTO_DOMAIN + imageId;
}

function jsonError(message, status = 400) {
  return new Response(
      JSON.stringify({
        error: message
      }),
      {
        status: status,
        headers: {
          'content-type': 'application/json'
        }
      }
  );
}
