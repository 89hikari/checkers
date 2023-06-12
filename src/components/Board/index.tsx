import { useEffect, useState } from 'react';
import useStore from 'app/hooks/useStore';
import classNames from 'classnames';
import { Modal, Typography } from 'antd';
import styles from './assets/styles/Board.module.scss';

const Board = () => {
    const board = useStore(state => state.board);
    const currentPlayer = useStore(state => state.currentPlayer);
    const move = useStore(state => state.move);
    const changeSide = useStore(state => state.changeSide);
    const reset = useStore(state => state.reset);
    const [selectedRow, setSelectedRow] = useState<number>();
    const [newRow, setNewRow] = useState<number[]>();
    const [newCell, setNewCell] = useState<number>();
    const [curRow, setCurRow] = useState<number>();
    const [curCell, setCurCell] = useState<number>();
    const [availiblePositions, setAvailiblePositions] = useState<number[]>();
    const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);

    const blacksScore = 12 - board.map(el => el.map(piece => piece === 'w' || piece === 'wb' ? 1 : 0).filter(p => !!p)).reduce((a, b) => [...a, ...b]).length;
    const redsScore = 12 - board.map(el => el.map(piece => piece === 'b' || piece === 'bb' ? 1 : 0).filter(p => !!p)).reduce((a, b) => [...a, ...b]).length;

    const getAvailiblePositions = (rowIndex: number, positionIntex: number) => {
        if (board[rowIndex][positionIntex][0] !== currentPlayer) return;
        setCurCell(positionIntex);
        setCurRow(rowIndex);
        const availibleRowToMove = (board[rowIndex][positionIntex].length !== 2) ? (currentPlayer === 'b' ? [rowIndex - 1] : [rowIndex + 1]) : [rowIndex - 1, rowIndex + 1];
        const availiblePos = [positionIntex - 1, positionIntex + 1];
        let availiblePosItems: string[] = [];

        try {
            availiblePosItems = availibleRowToMove.map(el => board[el]).filter(el => el !== undefined).map(el => [el[availiblePos[0]], el[availiblePos[1]]]).reduce((a, b) => [...a, ...b]).filter(el => !(el === currentPlayer || el === currentPlayer + 'b'));
        } catch (error) { console.log(error); return; }

        if (availiblePosItems.filter(el => !!el).length <= 2) {
            if (availiblePosItems.filter(el => el === (currentPlayer === 'b' ? 'w' : 'b')).length != 0) {
                for (let i = 0; i < availiblePos.length; i++) {
                    let checkCanEat = false;
                    availibleRowToMove.forEach(e => {
                        checkCanEat = getNextLayerAvailibleItems(rowIndex, e, positionIntex, availiblePos[i]);
                        if (checkCanEat) return;
                    });
                    if (checkCanEat) break;
                }
                return;
            }
            setNewRow(availibleRowToMove);
            setAvailiblePositions(availiblePos.filter(el => el > -1 && el < 8 && availibleRowToMove.filter(elem => board[elem] !== undefined).map(elem => !board[elem][el]).length));
            return;
        }
    }

    const getNextLayerAvailibleItems = (oldRowIndex: number, newRowIndex: number, oldPosIndex: number, nexPosIndex: number) => {
        const nextRow = (newRowIndex < oldRowIndex ? newRowIndex - 1 : newRowIndex + 1);
        const nextCell = (nexPosIndex < oldPosIndex ? nexPosIndex - 1 : nexPosIndex + 1);
        try {
            if (board[newRowIndex][nexPosIndex] === (currentPlayer === 'b' ? 'w' : 'b')) {
                if (board[nextRow][nextCell] === '') {
                    setNewRow([nextRow]);
                    setAvailiblePositions([nextCell]);
                    return true;
                }
                return false;
            }
        } catch (error) { }

        setNewRow([newRowIndex]);
        setAvailiblePositions([nexPosIndex]);

        return false;
    }

    const setPieceClassnames = (pieceVal: string, row: number, cell: number) => {
        return classNames(
            styles.cell,
            { [styles.piece]: pieceVal },
            { [styles.black]: pieceVal === 'b' || pieceVal === 'bb' },
            { [styles.boss]: pieceVal === 'bb' || pieceVal === 'wb' },
            { [styles.white]: pieceVal === 'w' || pieceVal === 'wb' },
            { [styles.possible_move]: newRow?.indexOf(row) !== -1 && availiblePositions?.some(el => el === cell) },
            { [styles.selected]: row === curRow && cell === curCell }
        );
    }

    const resetVars = () => {
        setNewRow(undefined);
        setNewCell(undefined);
        setCurRow(undefined);
        setCurCell(undefined);
        setAvailiblePositions(undefined);
    }

    useEffect(() => {
        if (newRow !== undefined && newCell !== undefined && curRow !== undefined && curCell !== undefined && selectedRow !== undefined) {
            move(selectedRow, newCell, curRow, curCell);
            changeSide();
            resetVars();
        }
    }, [newCell && selectedRow]);


    const detectPieceAction = (row: number, cell: number) => {
        if (availiblePositions?.some(el => el === cell) && newRow?.indexOf(row) !== -1) {
            setNewCell(cell);
            setSelectedRow(row);
            return;
        }
        getAvailiblePositions(row, cell);
    }

    const handleReset = () => {
        setResetModalVisible(!resetModalVisible);
        resetVars();
        reset();
    }

    return (
        <div className={styles.wrapper}>
            <Typography.Title level={4} className={styles.reset} onClick={() => setResetModalVisible(!resetModalVisible)}>Reset</Typography.Title>
            <Modal
                open={resetModalVisible}
                onCancel={() => setResetModalVisible(!resetModalVisible)}
                onOk={() => handleReset()}
            >
                <Typography.Title level={4}>Are you sure?</Typography.Title>
            </Modal>
            <div className={styles.boarddata}>
                <Typography.Title level={3} className={styles.title}>Reds: <br/>{redsScore}</Typography.Title>
                <div className={styles.board}>
                    {board.map((row, i) =>
                        <div key={i} className={styles.row}>
                            {row.map((cell, j) => <div key={`${cell}${j}`} onClick={() => detectPieceAction(i, j)} className={setPieceClassnames(cell, i, j)}></div>)}
                        </div>
                    )}
                </div>
                <Typography.Title level={3} className={styles.title}>Blacks: <br/>{blacksScore}</Typography.Title>
            </div>
            <Typography.Title className={styles.title}>{currentPlayer === 'w' ? 'Reds' : 'Blacks'} turn</Typography.Title>
        </div>
    )
}

export default Board
