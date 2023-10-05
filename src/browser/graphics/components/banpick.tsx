import React, {useState, useEffect} from "react";
import {Button, TextField, Slide, Fade} from "@mui/material";

export const Banpick: React.FC = () => {
	const [text, setText] = useState<string>("");
	const [showText, setShowText] = useState<boolean>(false);

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// テキストを表示
		setShowText(true);

		// 3秒後にテキストを非表示にする
		setTimeout(() => {
			setShowText(false);
		}, 3000);
	};

	useEffect(() => {
		// フォームが再送信されたときにテキストを非表示にする
		if (showText) {
			setShowText(false);
		}
	}, [showText]);

	return (
		<div>
			<form onSubmit={handleFormSubmit}>
				<TextField
					label='テキストを入力してください'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				<Button type='submit' variant='contained' color='primary'>
					送信
				</Button>
			</form>
			<Slide in={true} direction='up'>
				<div>
					<Fade in={showText} timeout={2000}>
						<div>{text}</div>
					</Fade>
				</div>
			</Slide>
		</div>
	);
};
