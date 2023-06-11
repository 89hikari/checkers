import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface Slice {
    board: string[][],
    currentPlayer: string,
    move: (newRow: number, newCell: number, initialRow: number, initialCell: number) => void
}

const createSlice: StateCreator<Slice, [["zustand/devtools", never]], []> = (set, get) => ({
    board: [
        ['', 'w', '', 'w', '', 'w', '', 'w'],
        ['w', '', 'w', '', 'w', '', 'w', ''],
        ['', 'w', '', 'w', '', 'w', '', 'w'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['b', '', 'b', '', 'b', '', 'b', ''],
        ['', 'b', '', 'b', '', 'b', '', 'b'],
        ['b', '', 'b', '', 'b', '', 'b', '']
    ],
    currentPlayer: 'b',
    move: (newRow: number, newCell: number, initialRow: number, initialCell: number) => {
        const board = get().board;
        board[initialRow][initialCell] = '';
        board[newRow][newCell] = get().currentPlayer;

        const possibleEatenRow = Math.abs(newRow - initialRow) === 2;
        const possibleEatenCell = Math.abs(newCell - initialCell) === 2;

        if (possibleEatenRow && possibleEatenCell) {
            board[newRow > initialRow ? newRow - 1 :  newRow + 1][newCell > initialCell ? newCell - 1 :  newCell + 1] = '';
        }

        set({ board: board });
        set({ currentPlayer: get().currentPlayer === 'w' ? 'b' : 'w' });
    }
})

const useStore = create<Slice>()(devtools((...a) => ({
    ...createSlice(...a)
})));

export default useStore;
