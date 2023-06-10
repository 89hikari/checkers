import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface Slice {
    board: string[][]
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
    ]
})

const useStore = create<Slice>()(devtools((...a) => ({
    ...createSlice(...a)
})));

export default useStore;
