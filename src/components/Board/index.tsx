import { useEffect, useState } from 'react';
import useStore from 'app/hooks/useStore';
import classNames from 'classnames';
import styles from './assets/styles/Board.module.scss';

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
        setNewRow(availibleRowToMove);
        console.log(availiblePos)
        if (availiblePos.map(el => board[availibleRowToMove][el]).filter(el => !!el).length <= 1) {
            setAvailiblePositions(availiblePos.filter(el => el > -1 && el < 8));
            return;
        }
        setNewRow(undefined);
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
        if (newRow && newCell && curRow && curCell) {
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
        } else {
            setCurCell(cell);
            setCurRow(row);
            getAvailiblePositions(row, cell);
        }
    }

    return (
        <div className={styles.board}>
            {board.map((row, i) =>
                <div key={i} className={styles.row}>
                    {row.map((cell, j) => <div key={`${cell}${j}`} onClick={() => detectPieceAction(i, j)} className={setPieceClassnames(cell, i, j)}></div>)}
                </div>
            )}
        </div>
    )
}

export default Board
