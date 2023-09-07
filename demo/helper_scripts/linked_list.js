class LinkedList{
    constructor() {
        this.list = [];
        this.indexMap = {};
        this.currentIndex = 0;
    }

    push(item){
        this.list.push(item);
        this.indexMap[item] = this.list.length -1;
    }

    updateCurrent(item){
        this.currentIndex = this.indexMap[item]
    }

    next(){
        return this.list[++this.currentIndex];
    }

    previous(){
        return this.list[--this.currentIndex];
    }
}