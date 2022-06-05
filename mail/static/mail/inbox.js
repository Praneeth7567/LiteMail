document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email(){
  
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    }).then(response => response.json())
    .then(result=>{
      console.log(result);
    })
  }


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails

    const homediv = document.querySelector('#emails-view');
    const container_div = document.createElement('div')
    container_div.className = "container";
    emails.forEach( mail =>{
    // const mailsdiv = document.createElement('div');
    // const space = " ";
    // mailsdiv.append(mail.id);
    // mailsdiv.append(space);
    // mailsdiv.append(mail.sender);
    // mailsdiv.append(space);
    // mailsdiv.append(mail.subject);
    // mailsdiv.append(space);
    // mailsdiv.append(mail.timestamp);
    // mailsdiv.append(space);
    var row_div = document.createElement('div')
    row_div.className = "row";
    if(!mail.read)
      row_div.className = "row unread";
    else
      row_div.className = "row read";

    // var col_div1 = document.createElement('div');
    // col_div1.className = "col-1"
    // col_div1.append(mail.id);
    // row_div.appendChild(col_div1);

    var col1_div = document.createElement('div')
    col1_div.className = "col-3";
    col1_div.append(mail.sender);
    row_div.appendChild(col1_div);

    var col2_div = document.createElement('div')
    col2_div.className = "col-6";
    col2_div.append(mail.subject);
    row_div.appendChild(col2_div);

    var col3_div = document.createElement('div')
    col3_div.className = "col-3";
    col3_div.append(mail.timestamp);
    row_div.appendChild(col3_div);

    row_div.addEventListener('click',()=>{
      view = document.querySelector('#emails-view');
      fetch(`/emails/${mail.id}`)
       {
        
        mail_info = mail;
        var arch_btn = '<button id="arch_btn" onclick="toggle_Archive('+mail.id+')" class="btn btn-sm btn-outline-success float-right"><i class="fa fa-caret-square-o-down"></i> Archive</button>';
        if (mail.archived){
          arch_btn = '<button id="arch_btn" onclick="toggle_Archive('+mail.id+')" class="btn btn-sm btn-outline-danger float-right"><i class="fa fa-caret-square-o-up"></i> Unarchive</button>';
        }
        var content = 
        `<b>From: </b> ${mail.sender} ${arch_btn}<br>
        <b>To: </b> ${mail.recipients}<br>
        <b>Subject: </b> ${mail.subject}<br>
        <b>Timestamp: </b> ${mail.timestamp}<br><br>
        <button id="reply" onclick="reply(mail_info)" class="btn btn-sm btn-warning"><i class="fa fa-reply"></i> Reply</button><br><hr>${mail.body}<br>`;
        view.innerHTML = content;

      };

      fetch(`/emails/${mail.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      view.style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
    });

    container_div.append(row_div);
    homediv.append(container_div);
  })

});
}

function reply(mail_info){
  compose_email();
  document.querySelector('#compose-recipients').value = mail_info.sender;
  if(mail_info.subject.includes('RE: ')){
    document.querySelector('#compose-subject').value = mail_info.subject;
  }
  else{
    document.querySelector('#compose-subject').value = `RE: ${mail_info.subject}`;
  }
  document.querySelector('#compose-body').value = `On ${mail_info.timestamp} ${mail_info.sender} wrote: ${mail_info.body}`;

}

function toggle_Archive(mailId){
  var toggle = document.querySelector("#arch_btn").innerHTML;
  if(toggle=='<i class="fa fa-caret-square-o-down"></i> Archive'){
    fetch(`/emails/${mailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    document.querySelector("#arch_btn").innerHTML = '<i class="fa fa-caret-square-o-up"></i> Unarchive';
    document.querySelector("#arch_btn").className = "btn btn-sm btn-outline-danger float-right";
  }
  else{
    fetch(`/emails/${mailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    document.querySelector("#arch_btn").innerHTML = '<i class="fa fa-caret-square-o-down"></i> Archive';
    document.querySelector("#arch_btn").className = "btn btn-sm btn-outline-success float-right";
  }
}