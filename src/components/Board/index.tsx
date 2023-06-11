import { useEffect, useState } from 'react';
import useStore from 'app/hooks/useStore';
import classNames from 'classnames';
import styles from './assets/styles/Board.module.scss';
import { Typography } from 'antd';

const Board = () => {
    const board = useStore(state => state.board);
    const currentPlayer = useStore(state => state.currentPlayer);
    const move = useStore(state => state.move);
    const [newRow, setNewRow] = useState<number>();
    const [newCell, setNewCell] = useState<number>();
    const [curRow, setCurRow] = useState<number>();
    const [curCell, setCurCell] = useState<number>();
    const [availiblePositions, setAvailiblePositions] = useState<number[]>();

    const getAvailiblePositions = (rowIndex: number, positionIntex: number) => {
        if (board[rowIndex][positionIntex] !== currentPlayer) return;
        const availibleRowToMove = currentPlayer === 'b' ? rowIndex - 1 : rowIndex + 1;
        const availiblePos = [positionIntex - 1, positionIntex + 1];
        const availiblePosItems = availiblePos.map(el => board[availibleRowToMove][el]);

        if (availiblePosItems.filter(el => !!el).length <= 2) {
            if (availiblePosItems.filter(el => el === (currentPlayer === 'b' ? 'w' : 'b')).length != 0) {
                availiblePos.forEach((el) => {
                    getNextLayerAvailibleItems(rowIndex, availibleRowToMove, positionIntex, el);
                })
                return;
            }
            setNewRow(availibleRowToMove);
            setAvailiblePositions(availiblePos.filter(el => el > -1 && el < 8));
            return;
        }

        setNewRow(undefined);
        setNewCell(undefined);
        setCurRow(undefined);
        setCurCell(undefined);
    }

    const getNextLayerAvailibleItems = (oldRowIndex: number, newRowIndex: number, oldPosIndex: number, nexPosIndex: number) => {
        console.log(oldRowIndex, newRowIndex, oldPosIndex, nexPosIndex)
    }

    const setPieceClassnames = (pieceVal: string, row: number, cell: number) => {
        return classNames(
            styles.cell,
            { [styles.piece]: pieceVal },
            { [styles.black]: pieceVal === 'b' },
            { [styles.white]: pieceVal === 'w' },
            { [styles.selected]: row === newRow && availiblePositions?.some(el => el === cell) }
        );
    }

    useEffect(() => {
        if (newRow !== undefined && newCell !== undefined && curRow !== undefined && curCell !== undefined) {
            move(newRow, newCell, curRow, curCell);
            setNewRow(undefined);
            setNewCell(undefined);
            setCurRow(undefined);
            setCurCell(undefined);
            setAvailiblePositions(undefined);
        }
    }, [newCell]);


    const detectPieceAction = (row: number, cell: number) => {
        if (availiblePositions?.some(el => el === cell)) {
            setNewCell(cell);
            return;
        }
        setCurCell(cell);
        setCurRow(row);
        getAvailiblePositions(row, cell);
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.board}>
                {board.map((row, i) =>
                    <div key={i} className={styles.row}>
                        {row.map((cell, j) => <div key={`${cell}${j}`} onClick={() => detectPieceAction(i, j)} className={setPieceClassnames(cell, i, j)}></div>)}
                    </div>
                )}
            </div>
            <Typography.Title className={styles.title}>{currentPlayer === 'w' ? "Reds" : "Blacks"} turn</Typography.Title>
        </div>
    )
}

export default Board
