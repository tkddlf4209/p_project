import React, { Component, useRef } from "react";
import {
    Alert,
    Button,
    Container,
    Row,
    Col,
    Badge,
    Breadcrumb,
    Jumbotron,
    Modal,
    Table,
    Nav,
    Card,
    Navbar,
    Form,
    Image,
    FormControl
} from "react-bootstrap";
import * as $ from 'jquery'

import danger from './img/danger.png'
import normal from './img/normal.png'
import warning from './img/warning.png'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";


const socketSubscribe = (socket, app) => {
    socket.on("list", (data) => {
        app.setState({
            items: data
        });

        //console.log("list :  ", data);
    });
    socket.on("update", (data) => {
        app.state.items.forEach(oldItem => {
            data.forEach(newItem => {
                // Check if it matches
                if (oldItem.id == newItem.id && oldItem.status != newItem.status) {
                    newItem["update"] = true;
                    switch (newItem.status) {
                        case 0:
                            toast.success(<div>회로 {newItem.id} 정상<br /> {newItem.timestamp}</div>, {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                            });
                            break;
                        case 1:
                            toast.warning(<div>회로 {newItem.id} 연결끊김<br /> {newItem.timestamp}</div>, {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                            });
                            break;
                        case 2:
                            toast.error(<div>회로 {newItem.id} 화재발생<br /> {newItem.timestamp}</div>, {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                            });
                            break;
                    }
                    //window.scrollTo(0, app.refs[newItem.id].offsetTop);

                }
            })
        })

        app.setState({
            items: data
        });

        //console.log("@@@@" + app.refs);
        //console.log("update :  ", data);
    });

    socket.on('connect', function () {
        console.log('connect');

    });
    socket.on('event', function (data) {
        console.log('event');

    });
    socket.on('disconnect', function () {
        console.log('disconnect');
        socket.removeAllListeners();
    });
};

class DashboardCol extends Component {
    render() {
        const { bg, title, count } = this.props;
        return (
            <Col xs={12} md={6} lg={3} className="mb-1">
                <Card bg={bg} text="white" className="text-center p-2">
                    <blockquote className="blockquote mb-0 card-body">
                        <p>
                            {title}
                        </p>
                        <h2>
                            {count}
                        </h2>
                    </blockquote>
                </Card>
            </Col>
        );
    }
}



export default class Main extends Component {

    state = {
        items: [],
        filter: -1,

    }

    componentDidMount() {
        const socket = io.connect("http://localhost:3002");
        this.refs = React.createRef();
        socketSubscribe(socket, this);
    }

    componentDidUpdate() {
        // if (this.myRef) {
        //     console.log(this.myRef.current);
        // }

        if ($('.update').length) {
            var top = $('.update').offset().top;
            window.scrollTo({ top: top, behavior: 'smooth' })
        }

    }

    onFilterChange(event) {
        var filter = -1;
        switch (event.target.value) {
            case "전체":
                filter = -1;
                break;
            case "정상":
                filter = 0;
                break;
            case "미연결":
                filter = 1;
                break;
            case "화재발생":
                filter = 2;
                break;
        }

        this.setState({
            filter: filter
        });
    }

    render() {
        var countType = (status) => {
            const filter_items = this.state.items.filter(item => item.status === status);
            return filter_items.length;
        }

        var TrRow = (item) => {

            const scrollToRef = (ref) => {
                var top = ref.current.offsetTop + window.innerHeight / 5;
                window.scrollTo({ top: top, behavior: 'smooth' })
            }
            const myRef = React.createRef()
            const executeScroll = () => scrollToRef(myRef)

            return (
                <tr key={item.id} className={item.update ? "update" : ""} onClick={executeScroll} ref={myRef}>
                    <td>{item.id}</td>
                    <td>{item.timestamp}</td>
                    <td>
                        <span className="mr-2">
                            {item.status == 0 && "정상"}
                            {item.status == 1 && "미연결"}
                            {item.status == 2 && "화재발생"}
                        </span>
                        {item.status == 0 &&
                            <Badge pill variant="success">
                                normal
                            </Badge>
                        }
                        {item.status == 1 &&
                            <Badge pill variant="warning">
                                warning
                            </Badge>
                        }
                        {item.status == 2 &&
                            <Badge pill variant="danger">
                                danger
                            </Badge>
                        }

                    </td>
                    <td>
                        {item.status == 0 && <Image src={normal} width="15" roundedCircle />}
                        {item.status == 1 && <Image src={warning} width="15" roundedCircle />}
                        {item.status == 2 && <Image src={danger} width="15" roundedCircle />}
                    </td>
                </tr>
            )
        };

        return (
            <>
                <Container>
                    <Row>
                        <Col >
                            <Jumbotron fluid >
                                <Container>
                                    <h1>P형 화재수신기 모니터링 시스템</h1>
                                    <p>
                                        P-type fire receiver monitoring system
                                    </p>
                                </Container>
                            </Jumbotron>
                        </Col>
                    </Row>
                    <Row>
                        <DashboardCol bg="primary" title="전체" count={this.state.items.length} ></DashboardCol>
                        <DashboardCol bg={countType(0) > 0 ? "success" : "dark"} title="정상" count={countType(0)} ></DashboardCol>
                        <DashboardCol bg={countType(1) > 0 ? "warning" : "dark"} title="미연결" count={countType(1)} ></DashboardCol>
                        <DashboardCol bg={countType(2) > 0 ? "danger" : "dark"} title="화재" count={countType(2)} ></DashboardCol>
                    </Row>
                    <hr></hr>
                    <Row>
                        <Col xs={0} md={9} lg={9}></Col>
                        <Col xs={12} md={3} lg={3}>
                            <Form >
                                <Form.Group controlId="exampleForm.SelectCustom">
                                    {/* <Form.Label>Custom select</Form.Label> */}
                                    <Form.Control as="select"
                                        onChange={this.onFilterChange.bind(this)}
                                    >
                                        <option>전체</option>
                                        <option>정상</option>
                                        <option>미연결</option>
                                        <option>화재발생</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form >
                        </Col>
                    </Row>
                    <Row >
                        <Col>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>회로</th>
                                        <th>발생시간</th>
                                        <th>상태</th>
                                        <th width="10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {

                                        this.state.items.filter(item =>
                                            this.state.filter == -1 ? true : this.state.filter === item.status).map(item =>
                                                (
                                                    TrRow(item)
                                                )
                                            )
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                </Container>
                <ToastContainer />
            </>
        );
    }
}