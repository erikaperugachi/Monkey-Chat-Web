import React, { Component } from 'react'
import Textarea from 'react-autosize-textarea'
var $ = require('jquery');

class QuestionForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: '',
			loading : false,
			message : "",
			errorMail : false,
			errorText : false,
		};

		this.handleSubmitQuestion = this.handleSubmitQuestion.bind(this);
		this.handleOnChangeTextArea = this.handleOnChangeTextArea.bind(this);
	}
	
	render() {
		let rendering = <div className="wid-send-mail-header">
			<p className="wid-overlay-msg-title">
				We{"'"}re currently offline!
			</p>
			<p className="wid-overlay-msg-subtitle">
				Live support is available:<br/>
				{this.props.beginDay} - {this.props.endDay}<br/>
				{this.props.period} (EST)
			</p>
		</div>;
		let textClass = 'wid-textarea' + (this.state.errorText ? " wid-input-error" : "");

		switch(this.state.status){
			case "success":
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className="wid-send-mail-body">
						<div className="wid-check-container">
							<img src="https://cdn.criptext.com/messenger/enterprise_check.png" className="wid-overlay-check" />
							<p className="wid-overlay-msg-subtitle">
								Thank you! we received your message and will answer you ASAP!
							</p>
						</div>
					</div>
				</div>
				break;
			case "error":
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className="wid-send-mail-body">
						<div className="wid-check-container">
							<img src="https://cdn.criptext.com/messenger/enterprise_fail.png" className="wid-overlay-check" />
							<p className="wid-overlay-msg-subtitle">
								Sorry, the message wasn{"'"}t delivered. Please try again later.
							</p>
							<a href="#" onClick={ () => {this.setState({status : ""}) } } className="wid-go-back">Go Back</a>
						</div>
					</div>
				</div>
				break;
			default : 
				rendering = <div className='wid-send-mail'>
					{rendering}

					<div className="wid-send-mail-body">
						<p className="wid-overlay-msg-title wid-overlay-body-title">
							Leave us a Message!
						</p>
						<div className="wid-name-container">
							<label>
								Email
							</label> 
							<input ref="mail_address" onClick={ () => {this.setState({errorMail : false}) } } className={this.state.errorMail ? "wid-input-error" : null} defaultValue={this.state.email}/>
						</div>
						<div className="wid-textarea-container">
							<Textarea ref='textareaInput'
								className={textClass} 
								placeholder='Message' 
								value = {this.state.message}
								onChange={this.handleOnChangeTextArea}/>
						</div>
						{ this.state.loading 
							? <input type='button' value='Sending...' className='wid-input-button'></input>
							: <input type='submit' value='Send' className='wid-input-button' onClick={this.handleSubmitQuestion}></input>
						}
					</div>
				</div>
		}
		
		return rendering;

	}

	handleSubmitQuestion(event) {
		event.preventDefault();
		let email = this.refs.mail_address.value.trim();
		let text = this.state.message.trim();
		let invalidData = false;

		if(!text){
			this.setState({
				errorText : true,
			})
			invalidData = true;
		}
		if(!email || !email.match(/^[\w\-\+_]+(?:\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(?:\.[\w‌​\-\+_]+)*\s*$/)){
			this.setState({
				errorMail : true,
			})
			invalidData = true;
		}

		if(invalidData){
			return;
		}

		this.setState({status : '', loading : true, email : email})

		let params = { name: this.props.name,
			text : text,
			mail : email,
			sendTo : this.props.mail};
		apiCriptextCall({data : params},'POST','/enterprise/client/mail/send',(err, response) => {
			if(err && err.status != 200){
	            this.setState({status : "error", loading : false})
	        }else{
	        	let message = {
	        		bubbleType : "text",
					preview : text,
					recipientId	: this.props.rid,
					senderId : this.props.sid,
					status : 0,
					text : text
				}
				this.props.sendMessage(message);
		        this.setState({status : "success", loading : false})
	        }
	    });

	}

	handleOnChangeTextArea(event){
		this.setState({message: event.target.value, errorText : false});
	}
}

export default QuestionForm;


function apiCriptextCall(params, type, endpoint, callback){

    switch(type) {
        case 'GET':
            $.ajax({
                type    : type,
                url     : ""+endpoint,
                crossDomain: true,
                dataType: 'json',
                success: function(respObj){
                    callback(null, respObj);
                },
                error: function(err){
                    console.log('Error :'+JSON.stringify(err));
                    callback(err);
                }
            });
            break;
        case 'POST':
            $.ajax({
                type    : type,
                url     : ""+endpoint,
                crossDomain: true,
                dataType: 'json',
                data    : params,
                success: function(respObj){
                    //console.log('RespObj:'+JSON.stringify(respObj));
                    callback(null, respObj);
                },
                error: function(err){
                    console.log('Error :'+JSON.stringify(err));
                    callback(err);
                }
            });
            break;
        default:
            console.log('Unknown weather type!');
            break;
    }
}