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
    const [bossNewRows, setBossNewRows] = useState<number[]>([]);
    const [bossNewCells, setBossNewCells] = useState<number[]>([]);
    const [availiblePositions, setAvailiblePositions] = useState<number[]>([]);
    const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);

    const getCell = (row: number, cell: number) => board[row][cell];
    const isBoss = (row: number, cell: number) => board[row][cell].length === 2;
    const getOpponent = () => currentPlayer === 'b' ? 'w' : 'b';

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
        setBossNewRows([]);
        setBossNewCells([]);
        setAvailiblePositions([]);
        setNewRow(undefined);
        const availiblePos = [positionIntex - 1, positionIntex + 1];
        const opponent = getOpponent();

        if (!isBoss(rowIndex, positionIntex)) {
            const availibleRowToMove = currentPlayer === 'b' ? rowIndex - 1 : rowIndex + 1;
            let availiblePosItems: string[] = [];

            try {
                availiblePosItems = availiblePos.map(el => getCell(availibleRowToMove, el)).filter(el => el !== currentPlayer);
            } catch (ex) { return }

            if (availiblePosItems.filter(el => (el === opponent || el === opponent + 'b')).length != 0) {
                let checkCanEat = false;
                for (let i = 0; i < availiblePos.length; i++) {
                    checkCanEat = getNextLayerAvailibleItems(rowIndex, availibleRowToMove, positionIntex, availiblePos[i], false);
                    if (checkCanEat) return;
                }
                return;
            }
            setNewRow(availibleRowToMove);
            setAvailiblePositions(availiblePos.filter(el => el > -1 && el < 8 && !getCell(availibleRowToMove, el)));
        } else {
            const availibleRowsToMove = [rowIndex - 1, rowIndex + 1].filter(el => el > -1 && el < 8);

            let availiblePosItems: string[] = [];
            let bossRows: number[] = [];
            let bossPos: number[] = [];

            try {
                availiblePosItems =
                    availibleRowsToMove
                        .map(el => board[el])
                        .filter(el => el !== undefined)
                        .map(el => [el[availiblePos[0]], el[availiblePos[1]]])
                        .reduce((a, b) => [...a, ...b])
                        .filter(el => !(el === currentPlayer || el === currentPlayer + 'b'));
            } catch (ex) { return }

            if (availiblePosItems.filter(el => (el === opponent || el === opponent + 'b')).length != 0) {
                for (let i = 0; i < availiblePos.length; i++) {
                    availibleRowsToMove.forEach(e => {
                        let checkCanEat = getNextLayerAvailibleItems(rowIndex, e, positionIntex, availiblePos[i], true, bossRows, bossPos);
                    });
                }
                setBossNewRows(bossRows);
                setBossNewCells(bossPos);
                return;
            }

            setBossNewRows(availibleRowsToMove);
            setBossNewCells(availiblePos);
        }
    }

    const checkBossDiagonally = (row: number, cell: number) => {
        if (Math.abs(row % 2) === 0) {
            return Math.abs(cell % 2) !== 0;
        } else {
            return Math.abs(cell % 2) === 0;
        }
    }

    const getNextLayerAvailibleItems = (oldRowIndex: number, newRowIndex: number, oldPosIndex: number, nexPosIndex: number, boss: boolean, bossRows: number[] = [], bossPos: number[] = []) => {
        const cell = getCell(newRowIndex, nexPosIndex);
        if (cell === currentPlayer || cell === currentPlayer + 'b') return false;
        const opponent = getOpponent();
        const nextRow = (newRowIndex < oldRowIndex ? newRowIndex - 1 : newRowIndex + 1);
        const nextCell = (nexPosIndex < oldPosIndex ? nexPosIndex - 1 : nexPosIndex + 1);
        const isNextCellOpponent = cell === opponent || cell === opponent + 'b';

        if (boss) {
            try {
                if (isNextCellOpponent) {
                    if (getCell(nextRow, nextCell) === '') {
                        bossRows.push(nextRow);
                        bossPos.push(nextCell);
                    }
                    return false;
                }
            } catch (ex) { return false; }

            bossRows.push(newRowIndex);
            bossPos.push(nexPosIndex);

            return false;
        } else {
            try {
                if (isNextCellOpponent) {
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
    }

    const setPieceClassnames = (pieceVal: string, row: number, cell: number) => {

        let bossMoved:number[][] = [];
        try {
            bossMoved = bossNewRows.map(el => bossNewCells.map(e => [el, e])).reduce((a, b) => [...a, ...b]).filter(el => checkBossDiagonally(el[0], el[1]))
        } catch (error) { }

        const arrEqual = JSON.stringify(bossMoved.filter(el => !board[el[0]][el[1]])).includes(JSON.stringify([row, cell]));

        return classNames(
            styles.cell,
            { [styles.piece]: pieceVal },
            { [styles.black]: pieceVal === 'b' || pieceVal === 'bb' },
            { [styles.boss]: pieceVal === 'bb' || pieceVal === 'wb' },
            { [styles.white]: pieceVal === 'w' || pieceVal === 'wb' },
            {
                [styles.possible_move]:
                (row === newRow && availiblePositions.indexOf(cell) !== -1) || arrEqual
            },
            { [styles.selected]: row === curRow && cell === curCell }
        );
    }

    const resetVars = () => {
        setNewRow(undefined);
        setNewCell(undefined);
        setCurRow(undefined);
        setCurCell(undefined);
        setBossNewRows([]);
        setBossNewCells([]);
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
        let bossMoved:number[][] = [];
        try {
            bossMoved = bossNewRows.map(el => bossNewCells.map(e => [el, e])).reduce((a, b) => [...a, ...b]).filter(el => checkBossDiagonally(el[0], el[1]))
        } catch (error) { }

        const arrEqual = JSON.stringify(bossMoved.filter(el => !board[el[0]][el[1]])).includes(JSON.stringify([row, cell]));
        
        if (availiblePositions.indexOf(cell) !== -1 && row === newRow || arrEqual) {
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
