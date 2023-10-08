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
        ++this.currentIndex;
        if (this.currentIndex >= this.list.length){
            this.currentIndex = this.list.length - 1;
        }
        return this.list[this.currentIndex];
    }

    previous(){
        --this.currentIndex;
        if (this.currentIndex < 0){
            this.currentIndex = 0;
        }
        return this.list[this.currentIndex];
    }
}