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
    const [newRow, setNewRow] = useState<number>();
    const [newCell, setNewCell] = useState<number>();
    const [curRow, setCurRow] = useState<number>();
    const [curCell, setCurCell] = useState<number>();
    const [availiblePositions, setAvailiblePositions] = useState<number[]>([]);
    const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<string>('');

    const getCell = (row: number, cell: number) => board[row][cell];

    const getScore = (player: string) => {
        return 12 - board
            .map(el =>
                el.map(piece => piece === player || piece === player + 'b' ? 1 : 0)
                    .filter(p => !!p))
            .reduce((a, b) => [...a, ...b])
            .length;
    }

    const blacksScore = getScore('w');
    const redsScore = getScore('b');


    const getAvailiblePositions = (rowIndex: number, positionIntex: number) => {
        if (getCell(rowIndex, positionIntex)[0] !== currentPlayer) return;

        setCurCell(positionIntex);
        setCurRow(rowIndex);
        setNewRow(undefined);
        setAvailiblePositions([]);
        const availibleRowToMove = currentPlayer === 'b' ? rowIndex - 1 : rowIndex + 1;
        const availiblePos = [positionIntex - 1, positionIntex + 1];
        let availiblePosItems: string[] = [];

        try {
            availiblePosItems = availiblePos.map(el => getCell(availibleRowToMove, el)).filter(el => el !== currentPlayer);
        } catch (ex) { return }

        if (availiblePosItems.filter(el => !!el).length <= 2) {
            if (getCell(rowIndex, positionIntex).length === 2) {
                return;
            }
            if (availiblePosItems.filter(el => el === (currentPlayer === 'b' ? 'w' : 'b')).length != 0) {
                let checkCanEat = false;
                for (let i = 0; i < availiblePos.length; i++) {
                    checkCanEat = getNextLayerAvailibleItems(rowIndex, availibleRowToMove, positionIntex, availiblePos[i]);
                    if (checkCanEat) break;
                }
                return;
            }
            setNewRow(availibleRowToMove);
            setAvailiblePositions(availiblePos.filter(el => el > -1 && el < 8 && !getCell(availibleRowToMove, el)));
            return;
        }
    }

    const getNextLayerAvailibleItems = (oldRowIndex: number, newRowIndex: number, oldPosIndex: number, nexPosIndex: number) => {
        const nextRow = (newRowIndex < oldRowIndex ? newRowIndex - 1 : newRowIndex + 1);
        const nextCell = (nexPosIndex < oldPosIndex ? nexPosIndex - 1 : nexPosIndex + 1);
        try {
            if (getCell(newRowIndex, nexPosIndex) === (currentPlayer === 'b' ? 'w' : 'b')) {
                if (getCell(nextRow, nextCell) === '') {
                    setNewRow(nextRow);
                    setAvailiblePositions([nextCell]);
                    return true;
                }
                return false;
            }
        } catch (ex) { return false }

        setNewRow(newRowIndex);
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
            { [styles.possible_move]: row === newRow && availiblePositions?.some(el => el === cell) },
            { [styles.selected]: row === curRow && cell === curCell }
        );
    }

    const resetVars = () => {
        setNewRow(undefined);
        setNewCell(undefined);
        setCurRow(undefined);
        setCurCell(undefined);
        setAvailiblePositions([]);
    }

    useEffect(() => {
        if (newCell !== undefined && curRow !== undefined && curCell !== undefined && selectedRow !== undefined) {
            move(selectedRow, newCell, curRow, curCell);
            changeSide();
            resetVars();
        }
    }, [newCell]);


    const detectPieceAction = (row: number, cell: number) => {
        if (availiblePositions?.some(el => el === cell) && row === newRow) {
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
                <Typography.Title level={3} className={styles.title}>Reds: <br />{redsScore}</Typography.Title>
                <div className={styles.board}>
                    {board.map((row, i) =>
                        <div key={i} className={styles.row}>
                            {row.map((cell, j) => <div key={`${cell}${j}`} onClick={() => detectPieceAction(i, j)} className={setPieceClassnames(cell, i, j)}></div>)}
                        </div>
                    )}
                </div>
                <Typography.Title level={3} className={styles.title}>Blacks: <br />{blacksScore}</Typography.Title>
            </div>
            <Typography.Title className={styles.title}>{currentPlayer === 'w' ? 'Reds' : 'Blacks'} turn</Typography.Title>
        </div>
    )
}

export default Board
