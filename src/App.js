import {useEffect} from 'react';
import {Route, Routes, useNavigate, Navigate, useParams} from 'react-router-dom';
import {Menu, Alert} from 'antd';
import {NotificationOutlined, FileTextOutlined, CarryOutOutlined, FundOutlined, AimOutlined} from '@ant-design/icons';

import {License} from './page/License';
import {Board} from './page/Board';
import {UserSubmissions} from './page/UserSubmissions';
import {Writeup} from './page/Writeup';
import {Game} from './page/Game';
import {Announcements} from './page/Announcements';
import {Triggers} from './page/Triggers';
import {UserProfile} from './page/UserProfile';
import {Terms} from './page/Terms';
import {LoginOther} from './page/LoginOther';
import {Header} from './widget/Header';
import {Footer} from './widget/Footer';
import {TemplateFile} from './widget/Template';
import {useGameInfo} from './logic/GameInfo';
import {NotFound} from './utils'
import {SYBIL_ROOT} from './branding';
import {TABID} from './wish';

import './App.less';

function InfoRouter() {
    let {page} = useParams();
    let nav = useNavigate();
    let info = useGameInfo();

    return (
        <div className="slim-container">
            <Menu className="router-menu" selectedKeys={[page]} onSelect={(e)=>{nav(`/info/${e.key}`);}} mode="horizontal">
                <Menu.Item key="announcements"><NotificationOutlined /> 比赛公告</Menu.Item>
                <Menu.Item key="triggers"><CarryOutOutlined /> 赛程安排</Menu.Item>
                {info.feature.templates.map(([name, title])=>(
                    <Menu.Item key={name}><FileTextOutlined /> {title}</Menu.Item>
                ))}
            </Menu>
            <br />
            {
                page==='announcements' ?
                    <Announcements /> :
                page==='triggers' ?
                    <Triggers /> :
                <TemplateFile name={page} />
            }
        </div>
    );
}

function BoardRouter() {
    let {name} = useParams();
    let nav = useNavigate();

    return (
        <div>
            <Menu className="router-menu" selectedKeys={[name]} onSelect={(e)=>{nav(`/board/${e.key}`);}} mode="horizontal">
                <Menu.Item key="score_pku"><FundOutlined /> 北京大学排名</Menu.Item>
                <Menu.Item key="first_pku"><AimOutlined /> 北京大学一血榜</Menu.Item>
                <Menu.Item key="score_all"><FundOutlined /> 总排名</Menu.Item>
                <Menu.Item key="first_all"><AimOutlined /> 总一血榜</Menu.Item>
            </Menu>
            <Board key={name} name={name} />
        </div>
    );
}

function PageStateReporter() {
    let info = useGameInfo();

    useEffect(()=>{
        function on_focus() {
            fetch(`${SYBIL_ROOT}event?name=focus&tabid=${TABID}`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        function on_blur() {
            fetch(`${SYBIL_ROOT}event?name=blur&tabid=${TABID}`, {
                method: 'POST',
                credentials: 'include',
            });
        }

        if(info.user && info.user.terms_agreed) {
            window.addEventListener('focus', on_focus);
            window.addEventListener('blur', on_blur);
            return ()=>{
                window.removeEventListener('focus', on_focus);
                window.removeEventListener('blur', on_blur);
            };
        }
    }, [info.user]);

    return null;
}

export function App() {
    return (
        <div>
            <PageStateReporter />
            <Header />
            <div className="main-container">
                <Alert.ErrorBoundary>
                    <Routes>
                        <Route exact path="/" element={<Navigate to="/game" replace />} />
                        <Route exact path="/game" element={<Game />} />
                        <Route exact path="/game/:challenge" element={<Game />} />

                        <Route exact path="/board" element={<Navigate to="/board/score_pku" replace />} />
                        <Route exact path="/board/:name" element={<BoardRouter />} />

                        <Route exact path="/info" element={<Navigate to="/info/announcements" replace />} />
                        <Route exact path="/info/:page" element={<InfoRouter />} />

                        <Route exact path="/user/profile" element={<UserProfile />} />
                        <Route exact path="/user/submissions" element={<UserSubmissions />} />
                        <Route exact path="/user/terms" element={<Terms />} />

                        <Route exact path="/login/other" element={<LoginOther />} />

                        <Route exact path="/writeup" element={<Writeup />} />
                        <Route exact path="/license" element={<License />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Alert.ErrorBoundary>
            </div>
            <Footer />
        </div>
    );
}