const likeTweet = btn => {
  const tweetId = btn.parentNode.querySelector('[name=tweetId]').value;
  const creatorNickname = btn.parentNode.querySelector(
    '[name=creatorNickname]'
  ).value;
  const userId = btn.parentNode.querySelector('[name=userId]').value;

  const child = btn.children[0];

  fetch('/' + creatorNickname + '/' + tweetId + '/like', {
    method: 'POST',
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      if (data.action === 'like') {
        child.classList.add('fill-rose-800');
      } else {
        child.classList.remove('fill-rose-800');
      }
    })
    .catch(err => {
      console.log(err);
    });
};

/* const body = document.querySelector('html');

localStorage.getItem('darkMode') === 'true'
  ? body.classList.add('dark')
  : body.classList.remove('dark');


const switchTheme = document.querySelector('#switch-theme');
switchTheme.addEventListener('click', darkMode => {
  body.classList.toggle('dark');
  if (localStorage.getItem('darkMode') === 'true') {
    localStorage.setItem('darkMode', 'false');
  } else {
    localStorage.setItem('darkMode', 'true');
  }
}); */

//************************ anchor submit */

/* <form id="submit_this">.....</form>
<a id="fakeanchor" href="#"></a>

<script>
    $("a#fakeanchor").click(function()
    {
    $("#submit_this").submit();
    return false;
    });
</script> */
